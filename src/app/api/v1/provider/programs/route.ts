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
    if (userRole !== 'employer' && userRole !== 'provider') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Provider access required' } },
        { status: 403 }
      );
    }

    // Get provider profile to find their organization
    const { data: providerProfile, error: profileError } = await supabase
      .from('program_provider_profiles')
      .select('organization_id, organization_name')
      .eq('user_id', user.id)
      .single();

    if (profileError || !providerProfile) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'PROFILE_NOT_FOUND', message: 'Provider profile not found' } },
        { status: 404 }
      );
    }

    const organizationId = providerProfile.organization_id;

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const per_page = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') || '20', 10)));

    // Build query
    let query = supabase
      .from('opportunities')
      .select(`
        id, title, slug, category, status, location_country, location_city,
        start_date, application_deadline, spots_available, spots_filled, created_at
      `, { count: 'exact' })
      .eq('organization_id', organizationId);

    // Status filter
    if (status) {
      const statuses = status.split(',').map((s) => s.trim()).filter(Boolean);
      if (statuses.length > 0) {
        query = query.in('status', statuses);
      }
    }

    // Category filter
    if (category) {
      const categories = category.split(',').map((c) => c.trim()).filter(Boolean);
      if (categories.length > 0) {
        query = query.in('category', categories);
      }
    }

    // Sorting
    query = query.order('created_at', { ascending: false });

    // Pagination
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;
    query = query.range(from, to);

    const { data: programs, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'QUERY_ERROR', message: error.message } },
        { status: 500 }
      );
    }

    // Get application counts for each program
    const programIds = (programs ?? []).map((p: { id: string }) => p.id);
    let applicationCounts: Record<string, number> = {};

    if (programIds.length > 0) {
      const { data: countData } = await supabase
        .from('applications')
        .select('opportunity_id')
        .in('opportunity_id', programIds)
        .is('deleted_at', null);

      if (countData) {
        for (const row of countData) {
          const oppId = (row as { opportunity_id: string }).opportunity_id;
          applicationCounts[oppId] = (applicationCounts[oppId] || 0) + 1;
        }
      }
    }

    // Transform response
    const items = (programs ?? []).map((program: Record<string, unknown>) => ({
      ...program,
      application_count: applicationCounts[program.id as string] || 0,
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

    // Verify provider role
    const userRole = user.user_metadata?.role;
    if (userRole !== 'employer' && userRole !== 'provider') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Provider access required' } },
        { status: 403 }
      );
    }

    // Get provider profile
    const { data: providerProfile, error: profileError } = await supabase
      .from('program_provider_profiles')
      .select('organization_id, organization_name')
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
    if (!body.title || !body.category || !body.description || !body.location_country) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Title, category, description, and location country are required' } },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['global_immersion', 'exchange', 'research', 'scholarships', 'internships', 'industry_projects', 'graduate_careers'];
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: `Invalid category. Must be one of: ${validCategories.join(', ')}` } },
        { status: 400 }
      );
    }

    // Validate work_mode if provided
    if (body.work_mode) {
      const validWorkModes = ['on_site', 'remote', 'hybrid'];
      if (!validWorkModes.includes(body.work_mode)) {
        return NextResponse.json(
          { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: `Invalid work mode. Must be one of: ${validWorkModes.join(', ')}` } },
          { status: 400 }
        );
      }
    }

    // Build insert data
    const programData: Record<string, unknown> = {
      title: body.title,
      category: body.category,
      status: 'draft',
      organization_id: providerProfile.organization_id,
      description: body.description ?? null,
      location_country: body.location_country ?? null,
      location_city: body.location_city ?? null,
      work_mode: body.work_mode ?? null,
      duration_value: body.duration_value ?? null,
      duration_unit: body.duration_unit ?? null,
      start_date: body.start_date ?? null,
      application_deadline: body.application_deadline ?? null,
      spots_available: body.spots_available ?? null,
      requirements: body.requirements ?? null,
      eligibility_criteria: body.eligibility_criteria ?? null,
    };

    // Generate slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);
    programData.slug = slug;

    const { data: created, error: createError } = await supabase
      .from('opportunities')
      .insert(programData)
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
