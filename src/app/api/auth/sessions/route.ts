import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Authentication required.' } },
        { status: 401 }
      );
    }

    const { data: sessions, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('last_active_at', { ascending: false });

    if (error) {
      // Table might not exist yet
      return NextResponse.json({
        success: true,
        data: { sessions: [], total: 0 },
      });
    }

    const formattedSessions = (sessions || []).map((s: Record<string, unknown>) => ({
      id: s.id,
      device: s.device_info || 'Unknown device',
      browser: s.browser || 'Unknown browser',
      ipAddress: s.ip_address || '',
      lastActiveAt: s.last_active_at,
      createdAt: s.created_at,
      isCurrent: false, // Would need session token comparison
    }));

    return NextResponse.json({
      success: true,
      data: {
        sessions: formattedSessions,
        total: formattedSessions.length,
      },
    });
  } catch (err) {
    console.error('[Sessions] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'An internal error occurred.' } },
      { status: 500 }
    );
  }
}
