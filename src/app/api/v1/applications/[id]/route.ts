import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { updateApplicationSchema } from '@/lib/validation/application-schemas';
import { stripHtmlTags } from '@/lib/applications/utils';

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

    const { data: application, error } = await supabase
      .from('applications')
      .select(`
        *,
        opportunities (
          id, title, description, category,
          location_country, location_city, work_mode,
          duration_months, compensation_type, deadline,
          organizations (id, name, logo_url, website)
        ),
        application_documents (*),
        application_status_history (*)
      `)
      .eq('id', id)
      .single();

    if (error || !application) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Application not found' } },
        { status: 404 }
      );
    }

    // Access check
    const userRole = user.user_metadata?.role;
    if (application.student_id !== user.id && userRole !== 'employer' && userRole !== 'admin') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    // Transform response
    const opp = application.opportunities as unknown as Record<string, unknown>;
    const org = (opp?.organizations as Record<string, unknown>) ?? {};

    const detail = {
      ...application,
      opportunity: {
        id: opp?.id ?? '',
        title: opp?.title ?? '',
        description: opp?.description ?? null,
        category: opp?.category ?? null,
        location_country: opp?.location_country ?? null,
        location_city: opp?.location_city ?? null,
        work_mode: opp?.work_mode ?? null,
        duration_months: opp?.duration_months ?? null,
        compensation_type: opp?.compensation_type ?? null,
        deadline: opp?.deadline ?? null,
        organization: {
          id: org.id ?? '',
          name: org.name ?? 'Unknown',
          logo_url: org.logo_url ?? null,
          website: org.website ?? null,
        },
      },
      documents: (application.application_documents ?? []),
      status_history: ((application.application_status_history ?? []) as { created_at: string }[]).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
      reviewer_notes: [],
    };

    // Clean up nested fields
    delete (detail as Record<string, unknown>).opportunities;
    delete (detail as Record<string, unknown>).application_documents;
    delete (detail as Record<string, unknown>).application_status_history;

    return NextResponse.json({ success: true, data: detail, error: null });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();
    const parsed = updateApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { cover_letter, status, version } = parsed.data;

    // Optimistic locking: fetch + version check
    const { data: existing, error: fetchError } = await supabase
      .from('applications')
      .select('id, student_id, status, version')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Application not found' } },
        { status: 404 }
      );
    }

    if (existing.student_id !== user.id) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    if (existing.version !== version) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VERSION_CONFLICT', message: 'This application was modified by another session. Please refresh.' } },
        { status: 409 }
      );
    }

    // Can only update drafts (or submit a draft)
    if (existing.status !== 'draft') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'INVALID_STATUS', message: 'Can only edit applications in draft status' } },
        { status: 400 }
      );
    }

    // Prepare update
    const updates: Record<string, unknown> = { version: version + 1 };
    if (cover_letter !== undefined) {
      updates.cover_letter = cover_letter;
      updates.cover_letter_plain = stripHtmlTags(cover_letter);
    }
    if (status === 'submitted') {
      // Validate submission requirements
      const cl = cover_letter ?? existing.cover_letter;
      if (!cl || stripHtmlTags(cl).trim().length === 0) {
        return NextResponse.json(
          { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Cover letter is required to submit' } },
          { status: 400 }
        );
      }
      updates.status = 'submitted';
      updates.submitted_at = new Date().toISOString();
    }

    const { data: updated, error: updateError } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .eq('version', version)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VERSION_CONFLICT', message: 'Concurrent modification detected' } },
        { status: 409 }
      );
    }

    // Record status history if submitted
    if (status === 'submitted') {
      await supabase.from('application_status_history').insert({
        application_id: id,
        from_status: 'draft',
        to_status: 'submitted',
        actor_id: user.id,
        actor_name: user.user_metadata?.display_name ?? user.email,
        actor_role: 'student',
      });
    }

    return NextResponse.json({ success: true, data: updated, error: null });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } },
      { status: 500 }
    );
  }
}
