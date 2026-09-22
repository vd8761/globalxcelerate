import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Verify program belongs to this organization
    const { data: program, error: programError } = await supabase
      .from('opportunities')
      .select('id, organization_id, status')
      .eq('id', id)
      .single();

    if (programError || !program) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Program not found' } },
        { status: 404 }
      );
    }

    if (program.organization_id !== providerProfile.organization_id) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'You do not own this program' } },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate status transition
    const validStatuses = ['draft', 'published', 'closed', 'archived'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` } },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.location_country !== undefined) updateData.location_country = body.location_country;
    if (body.location_city !== undefined) updateData.location_city = body.location_city;
    if (body.work_mode !== undefined) updateData.work_mode = body.work_mode;
    if (body.duration_value !== undefined) updateData.duration_value = body.duration_value;
    if (body.duration_unit !== undefined) updateData.duration_unit = body.duration_unit;
    if (body.start_date !== undefined) updateData.start_date = body.start_date;
    if (body.application_deadline !== undefined) updateData.application_deadline = body.application_deadline;
    if (body.spots_available !== undefined) updateData.spots_available = body.spots_available;
    if (body.requirements !== undefined) updateData.requirements = body.requirements;
    if (body.eligibility_criteria !== undefined) updateData.eligibility_criteria = body.eligibility_criteria;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'No valid fields to update' } },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from('opportunities')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'UPDATE_ERROR', message: updateError.message } },
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
