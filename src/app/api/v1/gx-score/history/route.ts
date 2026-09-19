import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'AUTH_001', message: 'Authentication required' } }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '30'), 100);
    const offset = (page - 1) * perPage;

    // Parse period to date threshold
    const periodDays: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const days = periodDays[period] || 30;
    const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { count } = await supabase
      .from('gx_score_history')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', user.id)
      .gte('created_at', threshold);

    const { data: history, error } = await supabase
      .from('gx_score_history')
      .select('id, composite_score, dimension_scores, grade_bracket, change_delta, trigger_type, capped, created_at')
      .eq('student_id', user.id)
      .gte('created_at', threshold)
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1);

    if (error) {
      return NextResponse.json({ success: false, error: { code: 'SYS_001', message: 'Failed to fetch history' } }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: history || [],
      pagination: {
        page,
        per_page: perPage,
        total_items: count || 0,
        total_pages: Math.ceil((count || 0) / perPage),
        has_next: offset + perPage < (count || 0),
        has_prev: page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SYS_001', message: 'Internal server error' } }, { status: 500 });
  }
}
