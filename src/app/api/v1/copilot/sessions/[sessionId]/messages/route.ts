import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'AUTH_001', message: 'Authentication required' } }, { status: 401 });
    }

    const { sessionId } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      return NextResponse.json({ success: false, error: { code: 'VAL_002', message: 'Invalid session ID format' } }, { status: 400 });
    }

    // Verify session belongs to user
    const { data: session } = await supabase
      .from('copilot_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('student_id', user.id)
      .single();

    if (!session) {
      return NextResponse.json({ success: false, error: { code: 'RES_001', message: 'Session not found' } }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '20'), 50);
    const offset = (page - 1) * perPage;

    const { count } = await supabase
      .from('copilot_messages')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    const { data: messages, error } = await supabase
      .from('copilot_messages')
      .select('id, role, content, tokens_used, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .range(offset, offset + perPage - 1);

    if (error) {
      return NextResponse.json({ success: false, error: { code: 'SYS_001', message: 'Failed to fetch messages' } }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: messages || [],
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
