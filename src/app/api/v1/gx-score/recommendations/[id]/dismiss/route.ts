import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'AUTH_001', message: 'Authentication required' } }, { status: 401 });
    }

    const { id } = await params;
    let reason: string | null = null;
    try {
      const body = await request.json();
      reason = body.reason || null;
    } catch {
      // No body is fine
    }

    const { data, error } = await supabase
      .from('gx_score_recommendations')
      .update({
        is_dismissed: true,
        dismissed_at: new Date().toISOString(),
        ...(reason && { dismiss_reason: reason }),
      })
      .eq('id', id)
      .eq('student_id', user.id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: { code: 'RES_001', message: 'Recommendation not found' } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SYS_001', message: 'Internal server error' } }, { status: 500 });
  }
}
