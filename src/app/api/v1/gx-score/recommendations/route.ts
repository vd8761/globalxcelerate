import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'AUTH_001', message: 'Authentication required' } }, { status: 401 });
    }

    const { data: recommendations, error } = await supabase
      .from('gx_score_recommendations')
      .select('*')
      .eq('student_id', user.id)
      .eq('is_completed', false)
      .eq('is_dismissed', false)
      .gt('expires_at', new Date().toISOString())
      .order('priority', { ascending: true })
      .order('estimated_impact', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: { code: 'SYS_001', message: 'Failed to fetch recommendations' } }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: recommendations || [],
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SYS_001', message: 'Internal server error' } }, { status: 500 });
  }
}
