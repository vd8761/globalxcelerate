import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types/auth';

const ROLE_PROFILE_TABLES: Record<string, string> = {
  employer: 'employer_profiles',
  university_admin: 'university_admin_profiles',
  program_provider: 'program_provider_profiles',
  platform_admin: 'platform_admin_profiles',
};

const ROLE_FIELDS: Record<string, string[]> = {
  employer: ['company_name', 'job_title', 'industry', 'company_size', 'company_website'],
  university_admin: ['institution_name', 'department', 'position', 'institution_website'],
  program_provider: ['organization_name', 'program_type', 'description', 'website'],
  platform_admin: ['access_level', 'department'],
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

    const body = await request.json();
    const { role, ...profileData } = body;

    if (!role || !ROLE_PROFILE_TABLES[role]) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_001', message: 'Invalid role.' } },
        { status: 400 }
      );
    }

    const table = ROLE_PROFILE_TABLES[role];
    const allowedFields = ROLE_FIELDS[role] || [];

    const filteredData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (profileData[field] !== undefined) {
        filteredData[field] = profileData[field];
      }
    }

    // For program providers, create an organization and link it
    if (role === 'program_provider' && filteredData.organization_name) {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: filteredData.organization_name as string,
          description: (filteredData.description as string) || null,
          website: (filteredData.website as string) || null,
        })
        .select('id')
        .single();

      if (orgError) {
        console.error('[ProfileSetup] Org creation error:', orgError);
        return NextResponse.json(
          { success: false, error: { code: 'SYS_001', message: 'Failed to create organization.' } },
          { status: 500 }
        );
      }

      (filteredData as Record<string, unknown>).organization_id = org.id;
    }

    const { error: updateError } = await supabase
      .from(table)
      .upsert({
        user_id: user.id,
        ...filteredData,
        onboarding_status: 'complete',
      }, { onConflict: 'user_id' });

    if (updateError) {
      console.error('[ProfileSetup] DB error:', updateError);
      return NextResponse.json(
        { success: false, error: { code: 'SYS_001', message: 'Failed to update profile.' } },
        { status: 500 }
      );
    }

    await supabase.auth.updateUser({
      data: { onboarding_completed: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[ProfileSetup] Error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'An internal error occurred.' } },
      { status: 500 }
    );
  }
}
