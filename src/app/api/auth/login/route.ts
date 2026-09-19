import { NextResponse } from 'next/server';
import { createApiSupabaseClient } from '@/lib/supabase/server';
import { getPostAuthRedirect } from '@/lib/auth/auth-redirect';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_001', message: 'Invalid email or password.' } },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const supabase = createApiSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { success: false, error: { code: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email address before signing in.' } },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_002', message: 'Invalid email or password.' } },
        { status: 401 }
      );
    }

    const user = data.user;
    const redirectTo = getPostAuthRedirect(user);

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        role: user.user_metadata?.role || null,
        redirectTo,
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        },
      },
    });
  } catch (err) {
    console.error('[Login] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'An internal error occurred.' } },
      { status: 500 }
    );
  }
}
