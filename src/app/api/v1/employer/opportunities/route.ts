import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  createOpportunitySchema,
  employerOpportunityListQuerySchema,
} from '@/lib/validation/employer-schemas';

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
    const parsed = employerOpportunityListQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { status, search, sort_by, sort_order, page, per_page } = parsed.data;

    // Build query
    let query = supabase
      .from('opportunities')
      .select(`
        id, title, slug, category, status,
        location_country, location_city, work_mode,
        duration_value, duration_unit,
        compensation_type, compensation_min, compensation_max,
        compensation_currency, compensation_period,
        start_date, application_deadline,
        spots_available, spots_filled,
        featured, published_at, created_at, updated_at
      `, { count: 'exact' })
      .eq('posted_by', user.id)
      .neq('status', 'archived');

    // Status filter
    if (status) {
      const statuses = status.split(',').map((s) => s.trim()).filter(Boolean);
      if (statuses.length > 0) {
        query = query.in('status', statuses);
      }
    }

    // Search by title
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    // Sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc', nullsFirst: false });

    // Pagination
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;
    query = query.range(from, to);

    const { data: opportunities, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'QUERY_ERROR', message: error.message } },
        { status: 500 }
      );
    }

    // Get application counts for each opportunity
    const opportunityIds = (opportunities ?? []).map((o: Record<string, unknown>) => o.id as string);
    let applicationCounts: Record<string, number> = {};

    if (opportunityIds.length > 0) {
      const { data: counts } = await supabase
        .from('applications')
        .select('opportunity_id')
        .in('opportunity_id', opportunityIds)
        .is('deleted_at', null);

      if (counts) {
        applicationCounts = counts.reduce((acc: Record<string, number>, row: Record<string, unknown>) => {
          const oppId = row.opportunity_id as string;
          acc[oppId] = (acc[oppId] ?? 0) + 1;
          return acc;
        }, {});
      }
    }

    // Attach application_count to each opportunity
    const items = (opportunities ?? []).map((opp: Record<string, unknown>) => ({
      ...opp,
      application_count: applicationCounts[opp.id as string] ?? 0,
    }));

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

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const parsed = createOpportunitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const opportunityData = {
      ...parsed.data,
      posted_by: user.id,
      status: 'draft' as const,
      spots_filled: 0,
    };

    const { data: created, error: createError } = await supabase
      .from('opportunities')
      .insert(opportunityData)
      .select()
      .single();

    if (createError) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'CREATE_ERROR', message: createError.message } },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: created, error: null },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } },
      { status: 500 }
    );
  }
}
