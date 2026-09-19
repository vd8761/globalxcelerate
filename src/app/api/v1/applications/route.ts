import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { applicationListQuerySchema, createApplicationSchema } from '@/lib/validation/application-schemas';
import { stripHtmlTags } from '@/lib/applications/utils';

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

    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = applicationListQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { status, search, sort_by, sort_order, page, per_page } = parsed.data;

    // Build query
    let query = supabase
      .from('applications')
      .select(`
        id, status, match_score, submitted_at, created_at, updated_at, cover_letter,
        opportunities!inner (
          id, title, application_deadline, category,
          location_country, location_city,
          organizations (id, name, logo_url)
        ),
        application_documents (id)
      `, { count: 'exact' })
      .eq('student_id', user.id)
      .is('deleted_at', null);

    // Status filter
    if (status) {
      const statuses = status.split(',').map((s) => s.trim()).filter(Boolean);
      if (statuses.length > 0) {
        query = query.in('status', statuses);
      }
    }

    // Search (opportunity title or org name)
    if (search) {
      query = query.or(`opportunities.title.ilike.%${search}%`);
    }

    // Sorting
    const sortColumn = sort_by === 'status' ? 'status' : sort_by === 'match_score' ? 'match_score' : sort_by;
    query = query.order(sortColumn, { ascending: sort_order === 'asc', nullsFirst: false });

    // Pagination
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'QUERY_ERROR', message: error.message } },
        { status: 500 }
      );
    }

    // Transform to ApplicationListItem shape
    const items = (data ?? []).map((row: Record<string, unknown>) => {
      const opp = row.opportunities as Record<string, unknown> | null;
      const org = (opp?.organizations as Record<string, unknown>) ?? {};
      const docs = (row.application_documents as unknown[]) ?? [];

      return {
        id: row.id,
        status: row.status,
        match_score: row.match_score,
        submitted_at: row.submitted_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        has_cover_letter: !!(row.cover_letter as string),
        document_count: docs.length,
        opportunity: {
          id: opp?.id ?? '',
          title: opp?.title ?? '',
          organization: {
            id: org.id ?? '',
            name: org.name ?? 'Unknown',
            logo_url: org.logo_url ?? null,
          },
          location: opp?.location_city ? `${opp.location_city}, ${opp.location_country}` : (opp?.location_country ?? null),
          type: opp?.category ?? null,
          deadline: opp?.application_deadline ?? null,
        },
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

    const body = await request.json();
    const parsed = createApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { opportunity_id, cover_letter, status } = parsed.data;

    // Check opportunity exists and deadline not passed
    const { data: opportunity, error: oppError } = await supabase
      .from('opportunities')
      .select('id, application_deadline, status, organization_id, spots_available, spots_filled')
      .eq('id', opportunity_id)
      .single();

    if (oppError || !opportunity) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Opportunity not found' } },
        { status: 404 }
      );
    }

    if (opportunity.application_deadline && new Date(opportunity.application_deadline) < new Date()) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'DEADLINE_PASSED', message: 'Application deadline has passed' } },
        { status: 400 }
      );
    }

    if (opportunity.spots_available && (opportunity.spots_filled ?? 0) >= opportunity.spots_available) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'MAX_APPLICATIONS', message: 'This opportunity has reached maximum applications' } },
        { status: 400 }
      );
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('student_id', user.id)
      .eq('opportunity_id', opportunity_id)
      .is('deleted_at', null)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'DUPLICATE_APPLICATION', message: 'You have already applied to this opportunity' } },
        { status: 409 }
      );
    }

    // Create application
    const applicationData: Record<string, unknown> = {
      student_id: user.id,
      opportunity_id,
      organization_id: opportunity.organization_id,
      status,
      cover_letter: cover_letter ?? null,
      cover_letter_plain: cover_letter ? stripHtmlTags(cover_letter) : null,
      version: 1,
    };

    if (status === 'submitted') {
      applicationData.submitted_at = new Date().toISOString();
    }

    const { data: created, error: createError } = await supabase
      .from('applications')
      .insert(applicationData)
      .select()
      .single();

    if (createError) {
      if (createError.code === '23505') {
        return NextResponse.json(
          { success: false, data: null, error: { code: 'DUPLICATE_APPLICATION', message: 'You have already applied to this opportunity' } },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, data: null, error: { code: 'CREATE_ERROR', message: createError.message } },
        { status: 500 }
      );
    }

    // Record status history
    await supabase.from('application_status_history').insert({
      application_id: created.id,
      from_status: null,
      to_status: status,
      actor_id: user.id,
      actor_name: user.user_metadata?.display_name ?? user.email,
      actor_role: 'student',
    });

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
