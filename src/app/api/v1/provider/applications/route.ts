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

    // Verify provider role
    const userRole = user.user_metadata?.role;
    if (userRole !== 'employer' && userRole !== 'program_provider') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Provider access required' } },
        { status: 403 }
      );
    }

    // Get provider profile
    const { data: providerProfile, error: profileError } = await supabase
      .from('program_provider_profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !providerProfile) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'PROFILE_NOT_FOUND', message: 'Provider profile not found' } },
        { status: 404 }
      );
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const programId = searchParams.get('program_id');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const per_page = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') || '20', 10)));

    // Build query - get applications for opportunities owned by this provider's org
    let query = supabase
      .from('applications')
      .select(`
        id, status, submitted_at, match_score, created_at,
        student_profiles!inner (
          id, full_name, email, gx_score
        ),
        opportunities!inner (
          id, title, organization_id
        )
      `, { count: 'exact' })
      .eq('opportunities.organization_id', providerProfile.organization_id)
      .is('deleted_at', null);

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

    // Program (opportunity) filter
    if (programId) {
      query = query.eq('opportunity_id', programId);
    }

    // Sort by submitted_at desc
    query = query.order('submitted_at', { ascending: false, nullsFirst: false });

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

    // Transform response
    const items = (applications ?? []).map((app: Record<string, unknown>) => {
      const student = app.student_profiles as Record<string, unknown> | null;
      const opportunity = app.opportunities as Record<string, unknown> | null;

      return {
        id: app.id,
        status: app.status,
        submitted_at: app.submitted_at,
        match_score: app.match_score,
        created_at: app.created_at,
        student: {
          id: student?.id ?? null,
          full_name: student?.full_name ?? null,
          email: student?.email ?? null,
          gx_score: student?.gx_score ?? null,
        },
        program: {
          id: opportunity?.id ?? null,
          title: opportunity?.title ?? null,
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

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Verify provider role
    const userRole = user.user_metadata?.role;
    if (userRole !== 'employer' && userRole !== 'program_provider') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Provider access required' } },
        { status: 403 }
      );
    }

    // Get provider profile
    const { data: providerProfile, error: profileError } = await supabase
      .from('program_provider_profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !providerProfile) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'PROFILE_NOT_FOUND', message: 'Provider profile not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.application_id || !body.status) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'application_id and status are required' } },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ['accepted', 'rejected', 'waitlisted', 'under_review'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` } },
        { status: 400 }
      );
    }

    // Get the application and verify it belongs to provider's org
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        id, status, opportunity_id,
        opportunities!inner (id, organization_id)
      `)
      .eq('id', body.application_id)
      .is('deleted_at', null)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Application not found' } },
        { status: 404 }
      );
    }

    // Verify the opportunity belongs to the provider's org
    const opportunity = application.opportunities as unknown as Record<string, unknown>;
    if (opportunity?.organization_id !== providerProfile.organization_id) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Application does not belong to your organization' } },
        { status: 403 }
      );
    }

    const previousStatus = application.status;

    // Update application status
    const { data: updated, error: updateError } = await supabase
      .from('applications')
      .update({ status: body.status })
      .eq('id', body.application_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'UPDATE_ERROR', message: updateError.message } },
        { status: 500 }
      );
    }

    // Record in application_status_history
    await supabase.from('application_status_history').insert({
      application_id: body.application_id,
      from_status: previousStatus,
      to_status: body.status,
      actor_id: user.id,
      actor_name: user.user_metadata?.display_name ?? user.email,
      actor_role: 'provider',
    });

    return NextResponse.json({ success: true, data: updated, error: null });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } },
      { status: 500 }
    );
  }
}
