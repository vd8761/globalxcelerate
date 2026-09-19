import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/auth/rate-limiter';
import { getAppOrigin } from '@/lib/auth/app-origin';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: Request) {

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      // Always return success to prevent enumeration
      return NextResponse.json({
        success: true,
        data: { message: 'If an account exists with that email, a password reset link has been sent.' },
      });
    }

    const { email } = parsed.data;

    // Rate limit check
    const rateLimitResult = checkRateLimit(`forgot_password:${email.toLowerCase()}`, 3, 3600);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMITED', message: 'Too many reset requests. Please try again later.' } },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const supabase = await createServerSupabaseClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getAppOrigin(request)}/auth/callback?type=recovery`,
    });

    // Always return success - no email enumeration
    return NextResponse.json({
      success: true,
      data: { message: 'If an account exists with that email, a password reset link has been sent.' },
    });
  } catch (err) {
    console.error('[ForgotPassword] Unexpected error:', err);
    // Still return success for security
    return NextResponse.json({
      success: true,
      data: { message: 'If an account exists with that email, a password reset link has been sent.' },
    });
  }
}
