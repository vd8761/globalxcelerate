import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ROLE_ONBOARDING } from '@/lib/auth/constants';
import { z } from 'zod';
import type { UserRole } from '@/types/auth';

const schema = z.object({
  role: z.enum(['student', 'employer', 'university_admin', 'program_provider', 'platform_admin']),
});

const ROLE_PROFILE_TABLES: Record<UserRole, string> = {
  student: 'student_profiles',
  employer: 'employer_profiles',
  university_admin: 'university_admin_profiles',
  program_provider: 'program_provider_profiles',
  platform_admin: 'platform_admin_profiles',
};

function createReadOnlyCookieClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async getAll() {
        const cookieStore = await cookies();
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });
}

export async function POST(request: Request) {
  try {
    const supabase = createReadOnlyCookieClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Authentication required.' } },
        { status: 401 }
      );
    }

    if (user.user_metadata?.role) {
      return NextResponse.json(
        { success: false, error: { code: 'BIZ_001', message: 'Role already assigned.' } },
        { status: 409 }
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_001', message: 'Invalid role selection.' } },
        { status: 400 }
      );
    }

    const { role } = parsed.data;

    if (role === 'platform_admin') {
      const isEligible = user.email?.endsWith('@globalxcelerate.com') || false;
      if (!isEligible) {
        return NextResponse.json(
          { success: false, error: { code: 'AUTH_003', message: 'You are not eligible for the administrator role.' } },
          { status: 403 }
        );
      }
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: { role, onboarding_completed: false },
    });

    if (updateError) {
      return NextResponse.json(
        { success: false, error: { code: 'SYS_001', message: 'Failed to assign role. Please try again.' } },
        { status: 500 }
      );
    }

    const profileTable = ROLE_PROFILE_TABLES[role];
    const { data: profileData, error: profileError } = await supabase
      .from(profileTable)
      .insert({ user_id: user.id, onboarding_status: 'not_started' })
      .select('id')
      .single();

    if (profileError) {
      await supabase.auth.updateUser({ data: { role: null, onboarding_completed: null } });
      return NextResponse.json(
        { success: false, error: { code: 'SYS_001', message: 'Failed to create profile. Please try again.' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        role,
        profileId: profileData.id,
        redirectTo: ROLE_ONBOARDING[role],
      },
    });
  } catch (err) {
    console.error('[RoleSelect] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'An internal error occurred.' } },
      { status: 500 }
    );
  }
}
