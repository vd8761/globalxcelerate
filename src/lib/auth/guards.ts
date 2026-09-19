import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import type { UserRole } from '@/types/auth';
import type { User } from '@supabase/supabase-js';

/**
 * Higher-order function wrapping API route handlers with auth check.
 * Returns 401 if not authenticated.
 */
export function withAuth(
  handler: (request: Request, user: User) => Promise<NextResponse>
) {
  return async (request: Request) => {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Authentication required.' } },
        { status: 401 }
      );
    }

    return handler(request, user);
  };
}

/**
 * Higher-order function extending withAuth to also check user role.
 * Returns 403 if role not in allowed list.
 */
export function withRole(
  handler: (request: Request, user: User) => Promise<NextResponse>,
  allowedRoles: UserRole[]
) {
  return withAuth(async (request: Request, user: User) => {
    const userRole = user.user_metadata?.role as UserRole | undefined;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_003', message: 'Insufficient permissions.' } },
        { status: 403 }
      );
    }

    return handler(request, user);
  });
}

/**
 * For Server Components - gets authenticated user or redirects to login.
 */
export async function requireAuth(): Promise<User> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

/**
 * For Server Components - checks role or redirects.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<User> {
  const user = await requireAuth();
  const userRole = user.user_metadata?.role as UserRole | undefined;

  if (!userRole || !allowedRoles.includes(userRole)) {
    redirect('/login');
  }

  return user;
}

/**
 * For Server Components - checks onboarding completion.
 */
export async function requireOnboarding(): Promise<User> {
  const user = await requireAuth();
  const onboardingCompleted = user.user_metadata?.onboarding_completed as boolean | undefined;

  if (!onboardingCompleted) {
    const role = user.user_metadata?.role as UserRole | undefined;
    if (role) {
      const onboardingPaths: Record<UserRole, string> = {
        student: '/student/onboarding',
        employer: '/employer/setup',
        university_admin: '/university/setup',
        program_provider: '/provider/setup',
        platform_admin: '/admin/setup',
      };
      redirect(onboardingPaths[role]);
    }
    redirect('/role-select');
  }

  return user;
}
