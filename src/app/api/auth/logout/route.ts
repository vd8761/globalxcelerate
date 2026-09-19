import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Not authenticated.' } },
        { status: 401 }
      );
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'SYS_001', message: 'Failed to sign out.' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { message: 'Signed out successfully.' } });
  } catch (err) {
    console.error('[Logout] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'An internal error occurred.' } },
      { status: 500 }
    );
  }
}
