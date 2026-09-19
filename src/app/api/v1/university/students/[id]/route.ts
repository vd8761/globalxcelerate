import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Get student profile
    const { data: student, error: studentError } = await supabase
      .from('student_profiles')
      .select('user_id, full_name, email, institution, gx_score, created_at')
      .eq('user_id', id)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Student not found' } },
        { status: 404 }
      );
    }

    // Verify the student belongs to this university (case-insensitive)
    if (student.institution?.toLowerCase() !== institutionName.toLowerCase()) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Student does not belong to your institution' } },
        { status: 403 }
      );
    }

    // Get student skills with skill details
    const { data: skills } = await supabase
      .from('student_skills')
      .select(`
        id,
        skill_id,
        proficiency_level,
        skills_master (id, name, category)
      `)
      .eq('student_id', id);

    // Get application history with opportunity details
    const { data: applications } = await supabase
      .from('applications')
      .select(`
        id, status, submitted_at, created_at, updated_at,
        opportunities (
          id, title, category,
          organizations (id, name)
        )
      `)
      .eq('student_id', id)
      .order('created_at', { ascending: false });

    const applicationHistory = (applications ?? []).map((app: Record<string, unknown>) => {
      const opp = app.opportunities as Record<string, unknown> | null;
      const org = (opp?.organizations as Record<string, unknown>) ?? {};
      return {
        id: app.id,
        status: app.status,
        submitted_at: app.submitted_at,
        created_at: app.created_at,
        updated_at: app.updated_at,
        opportunity: {
          id: opp?.id ?? '',
          title: opp?.title ?? '',
          category: opp?.category ?? null,
          organization: {
            id: org.id ?? '',
            name: org.name ?? 'Unknown',
          },
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          user_id: student.user_id,
          full_name: student.full_name,
          email: student.email,
          institution: student.institution,
          gx_score: student.gx_score,
          created_at: student.created_at,
        },
        skills: skills ?? [],
        applications: applicationHistory,
      },
      error: null,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } },
      { status: 500 }
    );
  }
}
