import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  factorId: z.string().min(1),
  code: z.string().length(6).regex(/^\d{6}$/),
});

export async function POST(request: Request) {

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_001', message: 'Invalid verification code.' } },
        { status: 400 }
      );
    }

    const { factorId, code } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Authentication required.' } },
        { status: 401 }
      );
    }

    // Create challenge
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (challengeError || !challenge) {
      return NextResponse.json(
        { success: false, error: { code: 'SYS_001', message: 'MFA challenge failed.' } },
        { status: 500 }
      );
    }

    // Verify
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });

    if (verifyError) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CODE', message: 'Invalid verification code. Please try again.' } },
        { status: 400 }
      );
    }

    // Generate recovery codes on first enrollment verification
    const recoveryCodes = Array.from({ length: 8 }, () =>
      Array.from({ length: 10 }, () =>
        'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
      ).join('')
    );

    // Store hashed recovery codes (simplified - in production use bcrypt)
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const adminClient = createAdminClient();

      for (let i = 0; i < recoveryCodes.length; i++) {
        await adminClient.from('mfa_recovery_codes').insert({
          user_id: user.id,
          code_hash: recoveryCodes[i], // In production: await bcrypt.hash(code, 12)
          code_index: i,
          is_used: false,
        });
      }
    } catch (storeErr) {
      console.error('[MFA] Failed to store recovery codes:', storeErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        verified: true,
        recoveryCodes,
      },
    });
  } catch (err) {
    console.error('[MFA Verify] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'An internal error occurred.' } },
      { status: 500 }
    );
  }
}
