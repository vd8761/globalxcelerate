import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/auth/rate-limiter';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

function getIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || request.headers.get('x-real-ip')
    || '0.0.0.0';
}

export async function POST(request: Request) {
  const ip = getIp(request);

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: true, data: { message: 'If an account exists, a verification email has been sent.' } }
      );
    }

    const { email } = parsed.data;

    // Rate limit
    const rateLimitResult = checkRateLimit(`resend_verification:${email.toLowerCase()}`, 5, 86400);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMITED', message: 'Too many verification requests. Please try again later.' } },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const supabase = await createServerSupabaseClient();
    await supabase.auth.resend({ type: 'signup', email });

    return NextResponse.json({
      success: true,
      data: { message: 'If an account exists, a verification email has been sent.' },
    });
  } catch (err) {
    console.error('[ResendVerification] Unexpected error:', err);
    return NextResponse.json(
      { success: true, data: { message: 'If an account exists, a verification email has been sent.' } }
    );
  }
}
