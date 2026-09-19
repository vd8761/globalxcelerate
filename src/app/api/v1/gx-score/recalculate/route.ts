import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { calculateGXScore } from '@/lib/ai/gx-score/calculate-gx-score';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'AUTH_001', message: 'Authentication required' } }, { status: 401 });
    }

    let targetStudentId = user.id;
    try {
      const body = await request.json();
      if (body.student_id && user.user_metadata?.role === 'admin') {
        targetStudentId = body.student_id;
      }
    } catch {
      // No body — use auth user
    }

    // Rate limit: check last calculated time
    const { data: existing } = await supabase
      .from('gx_scores')
      .select('last_calculated_at')
      .eq('student_id', targetStudentId)
      .single();

    if (existing?.last_calculated_at) {
      const lastCalc = new Date(existing.last_calculated_at).getTime();
      const oneHourAgo = Date.now() - 3600000;
      if (lastCalc > oneHourAgo && user.user_metadata?.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: { code: 'BIZ_003', message: 'Score was recalculated less than 1 hour ago. Please wait.' } },
          { status: 429 }
        );
      }
    }

    // Calculate
    const result = await calculateGXScore(targetStudentId, supabase, 'manual_recalc');

    return NextResponse.json({
      success: true,
      data: {
        status: 'completed',
        composite_score: result.composite_score,
        grade_bracket: result.grade_bracket,
        calculated_at: result.last_calculated_at,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SYS_001', message: 'Recalculation failed' } }, { status: 500 });
  }
}
