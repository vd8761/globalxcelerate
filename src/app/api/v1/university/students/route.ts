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

    // Get university admin profile to find institution_name
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

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'created_at';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const per_page = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') || '20', 10)));

    // Build query for students at this institution
    let query = supabase
      .from('student_profiles')
      .select('user_id, full_name, email, institution, gx_score, created_at', { count: 'exact' })
      .ilike('institution', institutionName);

    // Search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Sorting
    const validSortColumns = ['gx_score', 'full_name', 'created_at'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const ascending = sort_order === 'asc';
    query = query.order(sortColumn, { ascending, nullsFirst: false });

    // Pagination
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;
    query = query.range(from, to);

    const { data: students, error: studentsError, count } = await query;

    if (studentsError) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'QUERY_ERROR', message: studentsError.message } },
        { status: 500 }
      );
    }

    const studentList = students ?? [];
    const studentIds = studentList.map((s) => s.user_id);

    // Get skills count per student
    let skillsCounts: Record<string, number> = {};
    if (studentIds.length > 0) {
      const { data: skillsData } = await supabase
        .from('student_skills')
        .select('student_id')
        .in('student_id', studentIds);

      if (skillsData) {
        for (const row of skillsData) {
          skillsCounts[row.student_id] = (skillsCounts[row.student_id] || 0) + 1;
        }
      }
    }

    // Get applications count per student
    let applicationsCounts: Record<string, number> = {};
    if (studentIds.length > 0) {
      const { data: appsData } = await supabase
        .from('applications')
        .select('student_id')
        .in('student_id', studentIds);

      if (appsData) {
        for (const row of appsData) {
          applicationsCounts[row.student_id] = (applicationsCounts[row.student_id] || 0) + 1;
        }
      }
    }

    // Build response items
    const items = studentList.map((student) => ({
      user_id: student.user_id,
      full_name: student.full_name,
      email: student.email,
      institution: student.institution,
      gx_score: student.gx_score,
      created_at: student.created_at,
      skills_count: skillsCounts[student.user_id] || 0,
      applications_count: applicationsCounts[student.user_id] || 0,
    }));

    // Compute stats for all students at this institution
    const { data: allStudents } = await supabase
      .from('student_profiles')
      .select('user_id, gx_score')
      .ilike('institution', institutionName);

    const allStudentsList = allStudents ?? [];
    const allStudentIds = allStudentsList.map((s) => s.user_id);
    const total_students = allStudentsList.length;
    const avg_gx_score = total_students > 0
      ? Math.round((allStudentsList.reduce((sum, s) => sum + (s.gx_score || 0), 0) / total_students) * 10) / 10
      : 0;

    // Active in programs: students with at least one accepted application
    let active_in_programs = 0;
    let placement_rate = 0;
    if (allStudentIds.length > 0) {
      const { data: acceptedApps } = await supabase
        .from('applications')
        .select('student_id')
        .in('student_id', allStudentIds)
        .eq('status', 'accepted');

      if (acceptedApps) {
        const uniqueStudentsWithAccepted = new Set(acceptedApps.map((a) => a.student_id));
        active_in_programs = uniqueStudentsWithAccepted.size;
        placement_rate = total_students > 0
          ? Math.round((active_in_programs / total_students) * 1000) / 10
          : 0;
      }
    }

    const total = count ?? 0;
    return NextResponse.json({
      success: true,
      data: items,
      error: null,
      meta: {
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
      },
      stats: {
        total_students,
        avg_gx_score,
        active_in_programs,
        placement_rate,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } },
      { status: 500 }
    );
  }
}
