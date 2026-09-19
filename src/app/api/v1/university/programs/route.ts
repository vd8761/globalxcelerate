import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Verify university_admin role
    const role = user.user_metadata?.role;
    if (role !== 'university_admin') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'University admin access required' } },
        { status: 403 }
      );
    }

    // Get university admin profile
    const { data: adminProfile, error: profileError } = await supabase
      .from('university_admin_profiles')
      .select('institution_name')
      .eq('user_id', user.id)
      .single();

    if (profileError || !adminProfile) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'PROFILE_NOT_FOUND', message: 'University admin profile not found' } },
        { status: 404 }
      );
    }

    const institutionName = adminProfile.institution_name;

    // Get all student IDs at this institution
    const { data: students } = await supabase
      .from('student_profiles')
      .select('user_id')
      .ilike('institution', institutionName);

    const studentIds = (students ?? []).map((s) => s.user_id);

    if (studentIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        error: null,
        stats: {
          total_partnerships: 0,
          active_enrollments: 0,
          total_applications: 0,
        },
      });
    }

    // Get all applications for these students with opportunity and organization details
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select(`
        id, student_id, status, opportunity_id,
        opportunities (
          id, title, category,
          organizations (id, name)
        )
      `)
      .in('student_id', studentIds);

    if (appsError) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'QUERY_ERROR', message: appsError.message } },
        { status: 500 }
      );
    }

    const appsList = applications ?? [];

    // Aggregate by opportunity (program)
    const programMap: Record<string, {
      opportunity_id: string;
      title: string;
      category: string | null;
      organization: { id: string; name: string };
      enrolled_count: number;
      total_applicants: number;
    }> = {};

    for (const app of appsList) {
      const opp = app.opportunities as unknown as Record<string, unknown> | null;
      if (!opp) continue;

      const oppId = opp.id as string;
      const org = (opp.organizations as unknown as Record<string, unknown>) ?? {};

      if (!programMap[oppId]) {
        programMap[oppId] = {
          opportunity_id: oppId,
          title: (opp.title as string) ?? '',
          category: (opp.category as string) ?? null,
          organization: {
            id: (org.id as string) ?? '',
            name: (org.name as string) ?? 'Unknown',
          },
          enrolled_count: 0,
          total_applicants: 0,
        };
      }

      programMap[oppId].total_applicants += 1;
      if (app.status === 'accepted') {
        programMap[oppId].enrolled_count += 1;
      }
    }

    const programs = Object.values(programMap).sort((a, b) => b.total_applicants - a.total_applicants);

    // Compute overall stats
    const total_partnerships = programs.length;
    const active_enrollments = programs.reduce((sum, p) => sum + p.enrolled_count, 0);
    const total_applications = appsList.length;

    return NextResponse.json({
      success: true,
      data: programs,
      error: null,
      stats: {
        total_partnerships,
        active_enrollments,
        total_applications,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } },
      { status: 500 }
    );
  }
}
