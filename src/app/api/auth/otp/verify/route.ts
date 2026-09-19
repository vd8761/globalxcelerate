import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getPostAuthRedirect } from '@/lib/auth/auth-redirect';
import { z } from 'zod';

const schema = z.object({
  phone: z.string().min(5),
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must be numeric'),
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

    const { phone, code } = parsed.data;

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: 'sms',
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_OTP', message: 'Invalid or expired verification code.' } },
        { status: 400 }
      );
    }

    const user = data.user;
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'SYS_001', message: 'Verification failed.' } },
        { status: 500 }
      );
    }

    const redirectTo = getPostAuthRedirect(user);
    const isNewUser = !user.user_metadata?.role;

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        role: user.user_metadata?.role || null,
        redirectTo,
        isNewUser,
      },
    });
  } catch (err) {
    console.error('[OTP Verify] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'An internal error occurred.' } },
      { status: 500 }
    );
  }
}
