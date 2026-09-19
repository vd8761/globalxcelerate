import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { batchStatusSchema } from '@/lib/validation/application-schemas';
import { validateTransition } from '@/lib/applications/transitions';
import type { ApplicationStatus } from '@/lib/applications/types';

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
    if (userRole !== 'employer' && userRole !== 'admin') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Only employers and admins can perform batch operations' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = batchStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { application_ids, to_status, notes } = parsed.data;

    // Fetch all applications
    const { data: applications, error: fetchError } = await supabase
      .from('applications')
      .select('id, status, version, organization_id')
      .in('id', application_ids);

    if (fetchError) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'QUERY_ERROR', message: fetchError.message } },
        { status: 500 }
      );
    }

    const results: { id: string; success: boolean; error?: string }[] = [];
    let succeeded = 0;
    let failed = 0;

    for (const app of (applications ?? [])) {
      // Validate transition
      const validation = validateTransition(app.status as ApplicationStatus, to_status, userRole);
      if (!validation.valid) {
        results.push({ id: app.id, success: false, error: validation.error });
        failed++;
        continue;
      }

      // Update
      const updates: Record<string, unknown> = {
        status: to_status,
        version: app.version + 1,
      };

      if (['selected', 'rejected', 'withdrawn'].includes(to_status)) {
        updates.decided_at = new Date().toISOString();
      }
      if (to_status === 'under_review') {
        updates.reviewed_at = new Date().toISOString();
      }
      if (to_status === 'rejected' && notes) {
        updates.rejection_reason = notes;
      }

      const { error: updateError } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', app.id)
        .eq('version', app.version);

      if (updateError) {
        results.push({ id: app.id, success: false, error: 'Update failed (possible version conflict)' });
        failed++;
        continue;
      }

      // Record history
      await supabase.from('application_status_history').insert({
        application_id: app.id,
        from_status: app.status,
        to_status,
        actor_id: user.id,
        actor_name: user.user_metadata?.display_name ?? user.email,
        actor_role: userRole,
        notes: notes ?? null,
      });

      results.push({ id: app.id, success: true });
      succeeded++;
    }

    // Handle IDs not found
    const foundIds = new Set((applications ?? []).map((a) => a.id));
    for (const id of application_ids) {
      if (!foundIds.has(id)) {
        results.push({ id, success: false, error: 'Application not found' });
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        processed: application_ids.length,
        succeeded,
        failed,
        results,
      },
      error: null,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: (err as Error).message } },
      { status: 500 }
    );
  }
}
