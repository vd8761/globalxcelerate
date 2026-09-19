import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Check profile
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Build progress from profile and metadata
    const currentStep = user.user_metadata?.onboarding_step ?? 1;
    const stepStatuses = user.user_metadata?.step_statuses ?? {
      identity: currentStep > 1 ? 'completed' : 'active',
      education: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending',
      skills: currentStep > 3 ? 'completed' : currentStep === 3 ? 'active' : 'pending',
      experience: currentStep > 4 ? 'completed' : currentStep === 4 ? 'active' : 'pending',
      'career-goals': currentStep > 5 ? 'completed' : currentStep === 5 ? 'active' : 'pending',
      'global-preferences': currentStep > 6 ? 'completed' : currentStep === 6 ? 'active' : 'pending',
      portfolio: currentStep > 7 ? 'completed' : currentStep === 7 ? 'active' : 'pending',
      complete: currentStep === 8 ? 'active' : 'pending',
    };

    const progressData = {
      student_id: user.id,
      current_step: currentStep,
      step_statuses: stepStatuses,
      completion_percentage: profile?.profile_completion ?? 0,
      started_at: profile?.created_at ?? new Date().toISOString(),
      last_saved_at: profile?.updated_at ?? null,
      completed_at: profile?.onboarding_completed ? profile.updated_at : null,
      step_data: {
        identity: profile ? {
          first_name: profile.first_name ?? '',
          last_name: profile.last_name ?? '',
          middle_name: '',
          preferred_name: '',
          date_of_birth: '',
          gender: '',
          pronouns: '',
          nationality: profile.nationality ?? '',
          country_of_residence: profile.current_country ?? '',
          city: profile.current_city ?? '',
          phone_number: '',
          bio: '',
          profile_photo_url: '',
          profile_photo_thumbnail_url: '',
        } : undefined,
      },
    };

    return NextResponse.json({
      success: true,
      data: progressData,
      meta: { request_id: crypto.randomUUID(), timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Onboarding progress error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
