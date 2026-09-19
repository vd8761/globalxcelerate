import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { updateApplicationStatusSchema } from '@/lib/validation/employer-schemas';
import { validateTransition } from '@/lib/applications/transitions';
import type { ApplicationStatus } from '@/lib/applications/types';

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

    // Fetch application with related data, filtering through opportunity ownership
    const { data: application, error } = await supabase
      .from('applications')
      .select(`
        *,
        opportunities!inner (
          id, title, description, category,
          location_country, location_city, work_mode,
          duration_value, duration_unit,
          compensation_type, application_deadline, posted_by
        ),
        student_profiles (
          id, user_id, first_name, last_name, email, avatar_url,
          phone, university, degree_program, graduation_year,
          gx_score, bio, linkedin_url, portfolio_url
        ),
        application_documents (*),
        application_status_history (*)
      `)
      .eq('id', id)
      .eq('opportunities.posted_by', user.id)
      .single();

    if (error || !application) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Application not found' } },
        { status: 404 }
      );
    }

    // Transform response
    const opp = application.opportunities as unknown as Record<string, unknown>;
    const student = application.student_profiles as unknown as Record<string, unknown>;

    const detail = {
      id: application.id,
      status: application.status,
      match_score: application.match_score,
      match_score_snapshot: application.match_score_snapshot,
      cover_letter: application.cover_letter,
      submitted_at: application.submitted_at,
      reviewed_at: application.reviewed_at,
      decided_at: application.decided_at,
      created_at: application.created_at,
      updated_at: application.updated_at,
      opportunity: opp ? {
        id: opp.id,
        title: opp.title,
        description: opp.description,
        category: opp.category,
        location_country: opp.location_country,
        location_city: opp.location_city,
        work_mode: opp.work_mode,
        duration_value: opp.duration_value,
        duration_unit: opp.duration_unit,
        compensation_type: opp.compensation_type,
        application_deadline: opp.application_deadline,
      } : null,
      applicant: student ? {
        id: student.id,
        user_id: student.user_id,
        name: [student.first_name, student.last_name].filter(Boolean).join(' ') || 'Unknown',
        email: student.email,
        avatar_url: student.avatar_url,
        phone: student.phone,
        university: student.university,
        degree_program: student.degree_program,
        graduation_year: student.graduation_year,
        gx_score: student.gx_score,
        bio: student.bio,
        linkedin_url: student.linkedin_url,
        portfolio_url: student.portfolio_url,
      } : null,
      documents: (application.application_documents ?? []),
      status_history: ((application.application_status_history ?? []) as { created_at: string }[]).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    };

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

    const userRole = user.user_metadata?.role;
    if (userRole !== 'employer' && userRole !== 'platform_admin') {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Employer access required' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateApplicationStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { status: targetStatus, reviewer_notes } = parsed.data;

    // Fetch the application, verifying ownership through the opportunity's posted_by
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('id, status, version, opportunities!inner (posted_by)')
      .eq('id', id)
      .eq('opportunities.posted_by', user.id)
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Application not found' } },
        { status: 404 }
      );
    }

    // Validate status transition
    const currentStatus = application.status as ApplicationStatus;
    const transition = validateTransition(currentStatus, targetStatus as ApplicationStatus, 'employer');

    if (!transition.valid) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'INVALID_TRANSITION', message: transition.error ?? 'Invalid status transition' } },
        { status: 400 }
      );
    }

    // Prepare update
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {
      status: targetStatus,
      version: (application.version ?? 0) + 1,
    };

    // Mark reviewed_at on first review action
    if (currentStatus === 'submitted' && targetStatus === 'under_review') {
      updates.reviewed_at = now;
    }

    // Mark decided_at on terminal decisions
    if (['selected', 'rejected'].includes(targetStatus)) {
      updates.decided_at = now;
    }

    const { data: updated, error: updateError } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { success: false, data: null, error: { code: 'UPDATE_ERROR', message: updateError?.message ?? 'Failed to update application' } },
        { status: 500 }
      );
    }

    // Record status history
    await supabase.from('application_status_history').insert({
      application_id: id,
      from_status: currentStatus,
      to_status: targetStatus,
      actor_id: user.id,
      actor_name: user.user_metadata?.display_name ?? user.email,
      actor_role: 'employer',
      notes: reviewer_notes ?? null,
    });

    // If reviewer_notes provided, also save to reviewer_notes table
    if (reviewer_notes) {
      await supabase.from('reviewer_notes').insert({
        application_id: id,
        reviewer_id: user.id,
        reviewer_name: user.user_metadata?.display_name ?? user.email,
        content: reviewer_notes,
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
