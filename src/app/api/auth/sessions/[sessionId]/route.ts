import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Authentication required.' } },
        { status: 401 }
      );
    }

    // Verify session belongs to user
    const { data: session, error: fetchError } = await supabase
      .from('user_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .single();

    if (fetchError || !session) {
      return NextResponse.json(
        { success: false, error: { code: 'RES_001', message: 'Session not found.' } },
        { status: 404 }
      );
    }

    if (session.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_003', message: 'Insufficient permissions.' } },
        { status: 403 }
      );
    }

    // Terminate session
    const { error: updateError } = await supabase
      .from('user_sessions')
      .update({
        is_active: false,
        terminated_at: new Date().toISOString(),
        terminated_reason: 'logout',
      })
      .eq('id', sessionId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: { code: 'SYS_001', message: 'Failed to terminate session.' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Session terminated successfully.' },
    });
  } catch (err) {
    console.error('[Session Delete] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'An internal error occurred.' } },
      { status: 500 }
    );
  }
}
