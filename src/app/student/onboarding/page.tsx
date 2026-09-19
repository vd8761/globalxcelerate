import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const STEP_URL_MAP: Record<number, string> = {
  1: '/student/onboarding/identity',
  2: '/student/onboarding/education',
  3: '/student/onboarding/skills',
  4: '/student/onboarding/experience',
  5: '/student/onboarding/career-goals',
  6: '/student/onboarding/global-preferences',
  7: '/student/onboarding/portfolio',
  8: '/student/onboarding/complete',
};

export default async function OnboardingPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check student_profiles for onboarding status
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('onboarding_completed, profile_completion')
    .eq('user_id', user.id)
    .single();

  if (profile?.onboarding_completed) {
    redirect('/student/dashboard');
  }

  // Determine current step from user metadata or default to 1
  const currentStep = user.user_metadata?.onboarding_step ?? 1;
  const stepUrl = STEP_URL_MAP[currentStep] ?? STEP_URL_MAP[1];

  redirect(stepUrl);
}
