import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { statusTransitionSchema } from '@/lib/validation/application-schemas';
import { validateTransition } from '@/lib/applications/transitions';
import type { ApplicationStatus } from '@/lib/applications/types';

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

    const body = await request.json();
    const parsed = statusTransitionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { to_status, notes, withdrawal_reason, version } = parsed.data;

    // Fetch application
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('id, student_id, organization_id, status, version')
      .eq('id', id)
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Application not found' } },
        { status: 404 }
      );
    }

    // Version check
    if (application.version !== version) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VERSION_CONFLICT', message: 'Application was modified. Please refresh.' } },
        { status: 409 }
      );
    }

    // Determine actor role
    const userRole = user.user_metadata?.role ?? 'student';
    const isStudentOwner = application.student_id === user.id;

    // Validate access
    if (userRole === 'student' && !isStudentOwner) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    // Validate transition
    const validation = validateTransition(application.status as ApplicationStatus, to_status, userRole);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'INVALID_TRANSITION', message: validation.error ?? 'Invalid status transition' } },
        { status: 400 }
      );
    }

    // Prepare update
    const updates: Record<string, unknown> = {
      status: to_status,
      version: version + 1,
    };

    if (to_status === 'submitted') updates.submitted_at = new Date().toISOString();
    if (to_status === 'under_review') updates.reviewed_at = new Date().toISOString();
    if (['selected', 'rejected', 'withdrawn'].includes(to_status)) updates.decided_at = new Date().toISOString();
    if (to_status === 'withdrawn') updates.withdrawal_reason = withdrawal_reason;
    if (to_status === 'rejected') {
      updates.rejection_reason = notes;
      updates.rejection_feedback = parsed.data.rejection_feedback ?? null;
    }

    // Perform update with optimistic locking
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

    // Record history
    const historyEntry = {
      application_id: id,
      from_status: application.status,
      to_status,
      actor_id: user.id,
      actor_name: user.user_metadata?.display_name ?? user.email,
      actor_role: userRole,
      notes: notes ?? withdrawal_reason ?? null,
    };

    const { data: history } = await supabase
      .from('application_status_history')
      .insert(historyEntry)
      .select()
      .single();

    return NextResponse.json({
      success: true,
      data: { application: updated, history_entry: history },
      error: null,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } },
      { status: 500 }
    );
  }
}
