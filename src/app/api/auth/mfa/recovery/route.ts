import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  code: z.string().min(8).max(12),
});

export async function POST(request: Request) {

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_001', message: 'Invalid recovery code.' } },
        { status: 400 }
      );
    }

    const { code } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Authentication required.' } },
        { status: 401 }
      );
    }

    // Fetch unused recovery codes for user
    const { data: codes, error: fetchError } = await supabase
      .from('mfa_recovery_codes')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_used', false);

    if (fetchError || !codes || codes.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_002', message: 'No valid recovery codes found.' } },
        { status: 400 }
      );
    }

    // Find matching code (simplified - in production use bcrypt.compare)
    const matchedCode = codes.find((c: Record<string, unknown>) => c.code_hash === code);

    if (!matchedCode) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_002', message: 'Invalid recovery code.' } },
        { status: 400 }
      );
    }

    // Mark code as used
    await supabase
      .from('mfa_recovery_codes')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('id', matchedCode.id);

    const remainingCodes = codes.length - 1;

    return NextResponse.json({
      success: true,
      data: {
        verified: true,
        remainingCodes,
      },
    });
  } catch (err) {
    console.error('[MFA Recovery] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'An internal error occurred.' } },
      { status: 500 }
    );
  }
}
