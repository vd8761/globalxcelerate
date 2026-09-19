import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Fetch the opportunity
    const { data: opportunity, error: fetchError } = await supabase
      .from('opportunities')
      .select('id, posted_by, status, title, description, category, location_country, work_mode')
      .eq('id', id)
      .single();

    if (fetchError || !opportunity) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Opportunity not found' } },
        { status: 404 }
      );
    }

    if (opportunity.posted_by !== user.id) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'You do not have permission to publish this opportunity' } },
        { status: 403 }
      );
    }

    // Only drafts can be published
    if (opportunity.status !== 'draft') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'INVALID_STATUS', message: `Cannot publish an opportunity with status '${opportunity.status}'. Only draft opportunities can be published.` } },
        { status: 400 }
      );
    }

    // Validate that required fields are filled before publishing
    const missingFields: string[] = [];
    if (!opportunity.title) missingFields.push('title');
    if (!opportunity.description) missingFields.push('description');
    if (!opportunity.category) missingFields.push('category');
    if (!opportunity.location_country) missingFields.push('location_country');
    if (!opportunity.work_mode) missingFields.push('work_mode');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'INCOMPLETE_OPPORTUNITY', message: `Cannot publish: missing required fields: ${missingFields.join(', ')}` } },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const { data: updated, error: updateError } = await supabase
      .from('opportunities')
      .update({ status: 'published', published_at: now })
      .eq('id', id)
      .eq('posted_by', user.id)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'PUBLISH_ERROR', message: updateError?.message ?? 'Failed to publish opportunity' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      error: null,
      meta: {
        message: 'Opportunity published successfully',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } },
      { status: 500 }
    );
  }
}
