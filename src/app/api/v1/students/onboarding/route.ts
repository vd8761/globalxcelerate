import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { validateStepData } from '@/lib/onboarding/validation-schemas';
import { calculateOverallCompletion } from '@/lib/onboarding/completion';
import { STEP_NAMES, OPTIONAL_STEPS, STEP_NUMBERS } from '@/lib/onboarding/constants';

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { step, data, action } = body;

    // Validate step name
    if (!step || !STEP_NAMES.includes(step)) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_001', message: 'Invalid step name' } },
        { status: 400 }
      );
    }

    // Validate action
    if (!['save', 'next', 'skip'].includes(action)) {
      return NextResponse.json(
        { success: false, error: { code: 'VAL_001', message: 'Invalid action' } },
        { status: 400 }
      );
    }

    const stepNumber = STEP_NUMBERS[step] ?? 1;

    // Handle skip action
    if (action === 'skip') {
      if (!OPTIONAL_STEPS.includes(stepNumber)) {
        return NextResponse.json(
          { success: false, error: { code: 'BIZ_001', message: 'This step cannot be skipped' } },
          { status: 400 }
        );
      }

      const nextStep = stepNumber + 1;
      const stepStatuses = user.user_metadata?.step_statuses ?? {};
      stepStatuses[step] = 'skipped';

      await supabase.auth.updateUser({
        data: { onboarding_step: nextStep, step_statuses: stepStatuses },
      });

      return NextResponse.json({
        success: true,
        data: { current_step: nextStep, step_statuses: stepStatuses },
        meta: { request_id: crypto.randomUUID(), timestamp: new Date().toISOString() },
      });
    }

    // Validate data for 'next' action
    if (action === 'next') {
      const validation = validateStepData(step, data);
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VAL_002',
              message: 'Validation failed',
              details: validation.error?.fieldErrors
                ? Object.entries(validation.error.fieldErrors).map(([field, msgs]) => ({
                    field,
                    message: Array.isArray(msgs) ? msgs[0] : String(msgs),
                  }))
                : [],
            },
          },
          { status: 422 }
        );
      }
    }

    // Save data based on step
    if (data) {
      await saveStepData(supabase, user.id, step, data);
    }

    // Calculate completion
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const completionData: Record<string, unknown> = {
      identity: profile ? {
        first_name: profile.first_name,
        last_name: profile.last_name,
        nationality: profile.nationality,
        country_of_residence: profile.current_country,
        city: profile.current_city,
      } : {},
    };
    if (step === 'identity' && data) completionData.identity = data;
    if (step !== 'identity' && data) completionData[step] = data;

    const completionPercentage = calculateOverallCompletion(completionData);

    // Update profile completion
    await supabase
      .from('student_profiles')
      .update({
        profile_completion: completionPercentage,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    // Update step status and current step for 'next' action
    if (action === 'next') {
      const nextStep = stepNumber + 1;
      const stepStatuses = user.user_metadata?.step_statuses ?? {};
      stepStatuses[step] = 'completed';

      await supabase.auth.updateUser({
        data: { onboarding_step: nextStep, step_statuses: stepStatuses },
      });

      return NextResponse.json({
        success: true,
        data: {
          current_step: nextStep,
          step_statuses: stepStatuses,
          completion_percentage: completionPercentage,
        },
        meta: { request_id: crypto.randomUUID(), timestamp: new Date().toISOString() },
      });
    }

    // For 'save' action
    return NextResponse.json({
      success: true,
      data: { completion_percentage: completionPercentage },
      meta: { request_id: crypto.randomUUID(), timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Onboarding save error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

async function saveStepData(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userId: string,
  step: string,
  data: Record<string, unknown>
) {
  switch (step) {
    case 'identity': {
      await supabase
        .from('student_profiles')
        .upsert({
          user_id: userId,
          first_name: data.first_name as string || null,
          last_name: data.last_name as string || null,
          nationality: data.nationality as string || null,
          current_country: data.country_of_residence as string || null,
          current_city: data.city as string || null,
          email: data.email as string || null,
        }, { onConflict: 'user_id' });
      break;
    }
    case 'education': {
      const entries = (data as { entries?: unknown[] }).entries;
      if (entries && Array.isArray(entries)) {
        // Store as JSON in career_goals field (using available columns)
        await supabase
          .from('student_profiles')
          .update({
            degree_level: (entries[0] as Record<string, unknown>)?.degree_level as string || null,
            field_of_study: (entries[0] as Record<string, unknown>)?.field_of_study as string || null,
            gpa: (entries[0] as Record<string, unknown>)?.gpa_value as number || null,
          })
          .eq('user_id', userId);
      }
      break;
    }
    case 'skills': {
      const skills = (data as { skills?: Array<{ skill_id?: string | null; skill_name: string; proficiency: number }> }).skills;
      if (skills && Array.isArray(skills)) {
        // Get student profile id
        const { data: profile } = await supabase
          .from('student_profiles')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (profile) {
          // Delete existing skills for this student
          await supabase
            .from('student_skills')
            .delete()
            .eq('student_id', profile.id);

          // Insert new skills
          const skillRecords = skills
            .filter((s) => s.skill_id || s.skill_name)
            .map((s) => ({
              student_id: profile.id,
              skill_id: s.skill_id || crypto.randomUUID(),
              proficiency_level: s.proficiency,
            }));

          if (skillRecords.length > 0) {
            await supabase.from('student_skills').insert(skillRecords);
          }
        }
      }
      break;
    }
    case 'experience': {
      const entries = (data as { entries?: unknown[] }).entries;
      if (entries) {
        const totalMonths = (entries as Array<{ start_date: string; end_date?: string | null }>).reduce((acc, e) => {
          if (e.start_date) {
            const start = new Date(e.start_date);
            const end = e.end_date ? new Date(e.end_date) : new Date();
            return acc + Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth());
          }
          return acc;
        }, 0);
        await supabase
          .from('student_profiles')
          .update({ experience_months: totalMonths })
          .eq('user_id', userId);
      }
      break;
    }
    case 'career-goals': {
      await supabase
        .from('student_profiles')
        .update({ career_goals: data })
        .eq('user_id', userId);
      break;
    }
    case 'global-preferences': {
      const languages = (data as { languages?: unknown[] }).languages;
      await supabase
        .from('student_profiles')
        .update({ languages: languages ?? [] })
        .eq('user_id', userId);
      break;
    }
    case 'portfolio': {
      // Store in career_goals as extended metadata (using available JSON column)
      break;
    }
  }
}
