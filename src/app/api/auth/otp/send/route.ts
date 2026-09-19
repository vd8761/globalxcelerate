import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/auth/rate-limiter';
import { validatePhoneNumber, maskPhoneNumber } from '@/lib/auth/phone-validation';
import { z } from 'zod';

const schema = z.object({
  phone: z.string().min(5, 'Phone number is required'),
});

export async function POST(request: Request) {

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_001', message: 'Invalid phone number.' } },
        { status: 400 }
      );
    }

    const { phone } = parsed.data;

    // Validate E.164 format
    const validation = validatePhoneNumber(phone);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_002', message: validation.error || 'Invalid phone number format.' } },
        { status: 400 }
      );
    }

    // Rate limit
    const rateLimitResult = checkRateLimit(`otp_send:${validation.e164Format}`, 3, 3600);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMITED', message: 'Too many OTP requests. Please try again later.' } },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({ phone: validation.e164Format });

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'SYS_001', message: 'Failed to send verification code. Please try again.' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        maskedPhone: maskPhoneNumber(validation.e164Format),
        expiresIn: 60,
        message: 'Verification code sent.',
      },
    });
  } catch (err) {
    console.error('[OTP Send] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'An internal error occurred.' } },
      { status: 500 }
    );
  }
}
