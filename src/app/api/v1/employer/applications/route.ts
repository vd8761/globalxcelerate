import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { employerApplicationListQuerySchema } from '@/lib/validation/employer-schemas';

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

    const userRole = user.user_metadata?.role;
    if (userRole !== 'employer' && userRole !== 'platform_admin') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Employer access required' } },
        { status: 403 }
      );
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = employerApplicationListQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { status, opportunity_id, sort_by, sort_order, page, per_page } = parsed.data;

    // First get all opportunity IDs posted by this employer
    const { data: myOpportunities } = await supabase
      .from('opportunities')
      .select('id, title, category, location_country, location_city')
      .eq('posted_by', user.id);

    const oppIds = (myOpportunities ?? []).map((o: Record<string, unknown>) => o.id as string);

    if (oppIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        error: null,
        meta: { page, per_page, total: 0, total_pages: 0 },
      });
    }

    // Build query for applications to employer's opportunities
    let query = supabase
      .from('applications')
      .select(`
        id, student_id, opportunity_id, status, match_score, submitted_at, cover_letter, created_at, updated_at
      `, { count: 'exact' })
      .in('opportunity_id', oppIds);

    // Status filter
    if (status) {
      const statuses = status.split(',').map((s) => s.trim()).filter(Boolean);
      const validDbStatuses = ['submitted', 'under_review', 'shortlisted', 'interview', 'offered', 'accepted', 'rejected', 'withdrawn'];
      const validStatuses = statuses.filter(s => validDbStatuses.includes(s));

      if (statuses.length > 0 && validStatuses.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          error: null,
          meta: { page, per_page, total: 0, total_pages: 0 },
        });
      }

      if (validStatuses.length > 0) {
        query = query.in('status', validStatuses);
      }
    }

    // Filter by specific opportunity
    if (opportunity_id) {
      query = query.eq('opportunity_id', opportunity_id);
    }

    // Sorting
    const sortCol = sort_by === 'submitted_at' ? 'submitted_at' : 'created_at';
    query = query.order(sortCol, { ascending: sort_order === 'asc', nullsFirst: false });

    // Pagination
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;
    query = query.range(from, to);

    const { data: applications, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'QUERY_ERROR', message: error.message } },
        { status: 500 }
      );
    }

    // Get student names for all applications
    const studentIds = [...new Set((applications ?? []).map((a: Record<string, unknown>) => a.student_id as string))];
    let studentMap: Record<string, { first_name: string; last_name: string }> = {};
    if (studentIds.length > 0) {
      const { data: students } = await supabase
        .from('student_profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', studentIds);
      if (students) {
        studentMap = students.reduce((acc: Record<string, { first_name: string; last_name: string }>, s: Record<string, unknown>) => {
          acc[s.user_id as string] = { first_name: s.first_name as string, last_name: s.last_name as string };
          return acc;
        }, {});
      }
    }

    // Build opportunity lookup
    const oppMap = (myOpportunities ?? []).reduce((acc: Record<string, Record<string, unknown>>, o: Record<string, unknown>) => {
      acc[o.id as string] = o;
      return acc;
    }, {});

    // Transform response
    const items = (applications ?? []).map((row: Record<string, unknown>) => {
      const opp = oppMap[row.opportunity_id as string];
      const student = studentMap[row.student_id as string];

      return {
        id: row.id,
        status: row.status,
        match_score: row.match_score,
        submitted_at: row.submitted_at,
        has_cover_letter: !!(row.cover_letter as string),
        opportunity: {
          id: opp?.id ?? '',
          title: opp?.title ?? '',
          category: opp?.category ?? null,
          location: opp?.location_city
            ? `${opp.location_city}, ${opp.location_country}`
            : (opp?.location_country ?? null),
        },
        applicant: student ? {
          name: [student.first_name, student.last_name].filter(Boolean).join(' ') || 'Unknown',
        } : { name: 'Unknown' },
      };
    });

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
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } },
      { status: 500 }
    );
  }
}
