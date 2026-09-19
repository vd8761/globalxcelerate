import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { validatePassword } from '@/lib/auth/password-validation';
import { z } from 'zod';

const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export async function POST(request: Request) {

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_001', message: 'Invalid password format.' } },
        { status: 400 }
      );
    }

    const { password } = parsed.data;

    // Validate password complexity
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_002', message: passwordCheck.errors[0] } },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_LINK_EXPIRED', message: 'Your reset link has expired. Please request a new one.' } },
        { status: 401 }
      );
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'SYS_001', message: 'Failed to update password. Please try again.' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Password updated successfully.', redirectTo: '/login' },
    });
  } catch (err) {
    console.error('[ResetPassword] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'An internal error occurred.' } },
      { status: 500 }
    );
  }
}
