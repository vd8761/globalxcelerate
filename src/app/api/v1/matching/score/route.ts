import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { calculateMatchScore } from '@/lib/ai/matching/calculate-match-score';
import { getCachedScore } from '@/lib/ai/matching/cache-manager';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'AUTH_001', message: 'Authentication required' } }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id') || user.id;
    const opportunityId = searchParams.get('opportunity_id');

    if (!opportunityId) {
      return NextResponse.json({ success: false, error: { code: 'VAL_001', message: 'opportunity_id is required' } }, { status: 400 });
    }

    const cached = await getCachedScore(studentId, opportunityId, supabase);
    if (!cached) {
      return NextResponse.json({ success: false, error: { code: 'RES_001', message: 'No cached score found. Use POST to calculate.' } }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        student_id: cached.student_id,
        opportunity_id: cached.opportunity_id,
        composite_score: cached.composite_score,
        dimensions: cached.dimension_scores,
        skill_gaps: cached.skill_gaps,
        explanation: cached.explanation_text,
        from_cache: true,
        calculated_at: cached.calculated_at,
        expires_at: cached.expires_at,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SYS_001', message: 'Internal server error' } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'AUTH_001', message: 'Authentication required' } }, { status: 401 });
    }

    const body = await request.json();
    const { student_id, opportunity_id, force_recalculate } = body;

    if (!opportunity_id) {
      return NextResponse.json({ success: false, error: { code: 'VAL_001', message: 'opportunity_id is required' } }, { status: 400 });
    }

    const targetStudentId = student_id || user.id;

    // Validate permissions: student can only calculate own score unless admin
    const userRole = user.user_metadata?.role;
    if (targetStudentId !== user.id && userRole !== 'admin') {
      return NextResponse.json({ success: false, error: { code: 'AUTH_003', message: 'Insufficient permissions' } }, { status: 403 });
    }

    const result = await calculateMatchScore(targetStudentId, opportunity_id, supabase, { force_recalculate });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Calculation failed';
    if (message.includes('not found')) {
      return NextResponse.json({ success: false, error: { code: 'RES_001', message } }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: { code: 'SYS_001', message: 'Score calculation failed' } }, { status: 500 });
  }
}
