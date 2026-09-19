import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { updateOpportunitySchema } from '@/lib/validation/employer-schemas';

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

    const userRole = user.user_metadata?.role;
    if (userRole !== 'employer' && userRole !== 'platform_admin') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Employer access required' } },
        { status: 403 }
      );
    }

    const { data: opportunity, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        organizations (id, name, logo_url, industry),
        opportunity_skills (id, skill_id, importance, min_proficiency, skills_master(id, name))
      `)
      .eq('id', id)
      .eq('posted_by', user.id)
      .single();

    if (error || !opportunity) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Opportunity not found' } },
        { status: 404 }
      );
    }

    // Get application count for this opportunity
    const { count: applicationCount } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('opportunity_id', id)
      .is('deleted_at', null);

    const detail = {
      ...opportunity,
      organization: opportunity.organizations,
      skills: (opportunity.opportunity_skills ?? []).map((os: Record<string, unknown>) => ({
        id: (os.skills_master as Record<string, unknown>)?.id ?? os.skill_id,
        name: (os.skills_master as Record<string, unknown>)?.name ?? 'Unknown',
        importance: os.importance,
        min_proficiency: os.min_proficiency,
      })),
      application_count: applicationCount ?? 0,
    };

    delete (detail as Record<string, unknown>).organizations;
    delete (detail as Record<string, unknown>).opportunity_skills;

    return NextResponse.json({ success: true, data: detail, error: null });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const userRole = user.user_metadata?.role;
    if (userRole !== 'employer' && userRole !== 'platform_admin') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Employer access required' } },
        { status: 403 }
      );
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('opportunities')
      .select('id, posted_by, status')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Opportunity not found' } },
        { status: 404 }
      );
    }

    if (existing.posted_by !== user.id) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'You do not have permission to edit this opportunity' } },
        { status: 403 }
      );
    }

    // Cannot edit archived opportunities
    if (existing.status === 'archived') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'INVALID_STATUS', message: 'Cannot edit an archived opportunity' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = updateOpportunitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    // Remove undefined keys so we only update provided fields
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'No fields to update' } },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from('opportunities')
      .update(updates)
      .eq('id', id)
      .eq('posted_by', user.id)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'UPDATE_ERROR', message: updateError?.message ?? 'Failed to update opportunity' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: updated, error: null });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const userRole = user.user_metadata?.role;
    if (userRole !== 'employer' && userRole !== 'platform_admin') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Employer access required' } },
        { status: 403 }
      );
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('opportunities')
      .select('id, posted_by, status')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Opportunity not found' } },
        { status: 404 }
      );
    }

    if (existing.posted_by !== user.id) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'You do not have permission to delete this opportunity' } },
        { status: 403 }
      );
    }

    if (existing.status === 'archived') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'ALREADY_ARCHIVED', message: 'Opportunity is already archived' } },
        { status: 400 }
      );
    }

    // Soft-delete: set status to archived
    const { data: archived, error: archiveError } = await supabase
      .from('opportunities')
      .update({ status: 'archived' })
      .eq('id', id)
      .eq('posted_by', user.id)
      .select()
      .single();

    if (archiveError || !archived) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'ARCHIVE_ERROR', message: archiveError?.message ?? 'Failed to archive opportunity' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { id: archived.id, status: 'archived' }, error: null });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } },
      { status: 500 }
    );
  }
}
