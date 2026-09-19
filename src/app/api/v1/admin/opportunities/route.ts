import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json(
      { success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    )};
  }

  const { data: profile } = await supabase
    .from('platform_admin_profiles')
    .select('access_level, department')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return { error: NextResponse.json(
      { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
      { status: 403 }
    )};
  }

  return { user, profile };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const adminCheck = await verifyAdmin(supabase);
    if ('error' in adminCheck) return adminCheck.error;

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') || '20', 10)));
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * perPage;

    // Build query
    let query = supabase
      .from('opportunities')
      .select(
        'id, title, category, status, created_at, published_at, organization:organizations(name, logo_url), employer_id',
        { count: 'exact' }
      );

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply search filter
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1);

    const { data: opportunities, error: queryError, count } = await query;

    if (queryError) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'QUERY_ERROR', message: queryError.message } },
        { status: 500 }
      );
    }

    // Fetch employer info for the opportunities
    const employerIds = [...new Set((opportunities || []).map((o) => o.employer_id).filter(Boolean))];
    let employerMap = new Map<string, { full_name: string; email?: string }>();

    if (employerIds.length > 0) {
      const { data: employers } = await supabase
        .from('employer_profiles')
        .select('user_id, full_name, email')
        .in('user_id', employerIds);

      for (const emp of employers || []) {
        employerMap.set(emp.user_id, { full_name: emp.full_name, email: emp.email });
      }
    }

    // Format response
    const formattedOpportunities = (opportunities || []).map((opp) => ({
      id: opp.id,
      title: opp.title,
      category: opp.category,
      status: opp.status,
      created_at: opp.created_at,
      published_at: opp.published_at,
      organization: opp.organization,
      employer: employerMap.get(opp.employer_id) || null,
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / perPage);

    return NextResponse.json({
      success: true,
      data: formattedOpportunities,
      error: null,
      meta: {
        page,
        per_page: perPage,
        total,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.error('Admin opportunities list error:', error);
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const adminCheck = await verifyAdmin(supabase);
    if ('error' in adminCheck) return adminCheck.error;

    const body = await request.json();
    const { id, action, reason } = body;

    if (!id || !action) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'INVALID_REQUEST', message: 'id and action are required' } },
        { status: 400 }
      );
    }

    switch (action) {
      case 'approve': {
        const { data, error } = await supabase
          .from('opportunities')
          .update({
            status: 'published',
            published_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select('id, title, status, published_at')
          .single();

        if (error) {
          return NextResponse.json(
            { success: false, data: null, error: { code: 'APPROVE_ERROR', message: error.message } },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data,
          error: null,
          meta: null,
        });
      }

      case 'reject': {
        const updatePayload: Record<string, unknown> = {
          status: 'archived',
        };

        if (reason) {
          updatePayload.rejection_reason = reason;
        }

        const { data, error } = await supabase
          .from('opportunities')
          .update(updatePayload)
          .eq('id', id)
          .select('id, title, status')
          .single();

        if (error) {
          return NextResponse.json(
            { success: false, data: null, error: { code: 'REJECT_ERROR', message: error.message } },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: { ...data, rejection_reason: reason || null },
          error: null,
          meta: null,
        });
      }

      default:
        return NextResponse.json(
          { success: false, data: null, error: { code: 'INVALID_ACTION', message: `Unknown action: ${action}` } },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Admin opportunities moderation error:', error);
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
