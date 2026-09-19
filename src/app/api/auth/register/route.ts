import { NextResponse } from 'next/server';
import { createApiSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';

const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  tosAgreed: z.literal(true, { errorMap: () => ({ message: 'Terms must be accepted' }) }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return NextResponse.json(
        { success: false, error: { code: 'VAL_001', message: 'Validation failed', details } },
        { status: 400 }
      );
    }

    const { fullName, email, password } = parsed.data;

    const supabase = createApiSupabaseClient();
    const origin = request.headers.get('origin') || new URL(request.url).origin;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${origin}/auth/callback?type=email_verification`,
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { success: false, error: { code: 'RES_002', message: 'Unable to create account. Please try logging in or use a different email.' } },
          { status: 409 }
        );
      }
      console.error('[Register] Supabase error:', error.message);
      return NextResponse.json(
        { success: false, error: { code: 'SYS_001', message: 'Unable to create account. Please try again.' } },
        { status: 500 }
      );
    }

    if (data.user?.identities?.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'RES_002', message: 'Unable to create account. Please try logging in or use a different email.' } },
        { status: 409 }
      );
    }

    const requiresVerification = !data.session;

    return NextResponse.json(
      {
        success: true,
        data: {
          userId: data.user?.id,
          email,
          requiresVerification,
          session: data.session ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          } : null,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[Register] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'An internal error occurred.' } },
      { status: 500 }
    );
  }
}
