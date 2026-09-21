import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
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

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
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
    
    // Check if profile already exists first
    let { data: profileData } = await supabase
      .from(profileTable)
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    // If it doesn't exist, create it
    if (!profileData) {
      const { data: newProfileData, error: profileError } = await supabase
        .from(profileTable)
        .insert({ user_id: user.id })
        .select('id')
        .single();
        
      if (profileError) {
        console.error('[RoleSelect] profileError:', profileError);
        // We do not revert the role here because it might cause sync issues if the cookie is already set
        // The user can just try again, or they can use the role without a profile (though not ideal, they'll get caught by onboarding checks)
        return NextResponse.json(
          { success: false, error: { code: 'SYS_001', message: `Failed to create profile: ${profileError.message}` } },
          { status: 500 }
        );
      }
      profileData = newProfileData;
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
