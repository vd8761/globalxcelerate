import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { applicationSchema } from '@/validators/marketplace/application.schema';
import { generateReferenceNumber } from '@/lib/marketplace/reference-number';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID();

  try {
    const { id: opportunityId } = await params;
    const supabase = await createServerSupabaseClient();

    // Require authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Authentication required' }, meta: { request_id: requestId } },
        { status: 401 }
      );
    }

    // Validate body
    const body = await request.json();
    const parsed = applicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_001', message: 'Invalid application data', details: parsed.error.issues }, meta: { request_id: requestId } },
        { status: 400 }
      );
    }

    // Check opportunity exists and is open
    const { data: opportunity } = await supabase
      .from('opportunities')
      .select('id, status, application_deadline, spots_available, spots_filled')
      .eq('id', opportunityId)
      .single();

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: { code: 'RES_001', message: 'Opportunity not found' }, meta: { request_id: requestId } },
        { status: 404 }
      );
    }

    if (opportunity.status !== 'published') {
      return NextResponse.json(
        { success: false, error: { code: 'BIZ_002', message: 'This opportunity is no longer accepting applications' }, meta: { request_id: requestId } },
        { status: 410 }
      );
    }

    // Check deadline
    if (opportunity.application_deadline && new Date(opportunity.application_deadline) < new Date()) {
      return NextResponse.json(
        { success: false, error: { code: 'BIZ_002', message: 'Application deadline has passed' }, meta: { request_id: requestId } },
        { status: 410 }
      );
    }

    // Check duplicate application
    const { data: existingApp } = await supabase
      .from('applications')
      .select('id, reference_number')
      .eq('student_id', user.id)
      .eq('opportunity_id', opportunityId)
      .maybeSingle();

    if (existingApp) {
      return NextResponse.json(
        { success: false, error: { code: 'RES_002', message: 'You have already applied to this opportunity' }, meta: { request_id: requestId } },
        { status: 409 }
      );
    }

    // Get match score at time of submission
    const { data: matchScore } = await supabase
      .from('match_scores')
      .select('total_score')
      .eq('student_id', user.id)
      .eq('opportunity_id', opportunityId)
      .maybeSingle();

    // Generate unique reference number with retry
    let referenceNumber = '';
    let retries = 0;
    while (retries < 3) {
      referenceNumber = generateReferenceNumber();
      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('reference_number', referenceNumber)
        .maybeSingle();
      if (!existing) break;
      retries++;
    }

    // Insert application
    const { data: application, error } = await supabase
      .from('applications')
      .insert({
        student_id: user.id,
        opportunity_id: opportunityId,
        reference_number: referenceNumber,
        cover_letter: parsed.data.cover_letter || '',
        documents: parsed.data.documents,
        additional_answers: parsed.data.additional_answers || {},
        status: 'submitted',
        match_score_at_submission: matchScore?.total_score || null,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Application insert error:', error);
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: { code: 'RES_002', message: 'Duplicate application' }, meta: { request_id: requestId } },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: { code: 'SYS_001', message: 'Failed to submit application' }, meta: { request_id: requestId } },
        { status: 500 }
      );
    }

    // Increment spots_filled
    await supabase
      .from('opportunities')
      .update({ spots_filled: (opportunity.spots_filled || 0) + 1 })
      .eq('id', opportunityId);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: application.id,
          reference_number: application.reference_number,
          opportunity_id: application.opportunity_id,
          status: application.status,
          submitted_at: application.submitted_at,
          match_score_at_submission: application.match_score_at_submission,
        },
        meta: { request_id: requestId },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Apply error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'Internal server error' }, meta: { request_id: requestId } },
      { status: 500 }
    );
  }
}
