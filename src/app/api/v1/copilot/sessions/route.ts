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
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '10'), 50);
    const offset = (page - 1) * perPage;

    const { count } = await supabase
      .from('copilot_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', user.id);

    const { data: sessions, error } = await supabase
      .from('copilot_sessions')
      .select('id, is_active, messages_count, last_activity_at, created_at')
      .eq('student_id', user.id)
      .order('last_activity_at', { ascending: false })
      .range(offset, offset + perPage - 1);

    if (error) {
      return NextResponse.json({ success: false, error: { code: 'SYS_001', message: 'Failed to fetch sessions' } }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: sessions || [],
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
