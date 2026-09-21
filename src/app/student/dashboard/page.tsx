import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  GreetingHeader,
  ProfileCompletionWidget,
  GXScoreWidget,
  QuickActions,
  RecommendedOpportunities,
  ApplicationsSummary,
  DeadlinesWidget,
  NotificationsFeed,
  SavedOpportunities,
} from '@/components/dashboard';
import { DashboardClientWrapper } from '@/components/dashboard/dashboard-client-wrapper';

export const metadata = {
  title: 'Dashboard | GlobalXcelerate',
  description: 'Your personalized student dashboard',
};

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch student profile
  let { data: profile, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[Dashboard] Error fetching profile:', error.message || error, error.details || '');
  }

  // Check if onboarding is complete via user_metadata as a fallback
  const isOnboardingComplete = user.user_metadata?.onboarding_completed === true;

  // If the profile is completely missing (due to earlier failures), create a blank one
  if (!profile && !error && isOnboardingComplete) {
    const { data: newProfile, error: insertError } = await supabase
      .from('student_profiles')
      .insert({ user_id: user.id })
      .select('*')
      .single();
      
    if (insertError) {
      console.error('[Dashboard] Failed to auto-create missing profile:', insertError.message);
    } else {
      profile = newProfile;
    }
  }

  // Prevent infinite redirect loops: if onboarding is complete but profile still fails, just render with empty profile
  if (!isOnboardingComplete && !profile) {
    redirect('/student/onboarding');
  }

  // Provide a fallback profile if it's still null due to a persistent database error
  const safeProfile = profile || {
    first_name: 'Student',
    last_name: '',
    profile_photo_url: null,
    profile_completion: 0,
    gx_score: null,
  };

  // Compute GX grade
  const gxScore = safeProfile.gx_score || null;
  let gxGrade: string | null = null;
  if (gxScore !== null) {
    if (gxScore >= 90) gxGrade = 'A+';
    else if (gxScore >= 80) gxGrade = 'A';
    else if (gxScore >= 70) gxGrade = 'B+';
    else if (gxScore >= 60) gxGrade = 'B';
    else if (gxScore >= 50) gxGrade = 'C+';
    else if (gxScore >= 40) gxGrade = 'C';
    else gxGrade = 'D';
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Greeting — full width */}
        <GreetingHeader
          firstName={safeProfile.first_name || 'Student'}
          profilePhotoUrl={safeProfile.profile_photo_url}
        />

        {/* Profile completion + GX Score side by side */}
        <ProfileCompletionWidget completionPercentage={safeProfile.profile_completion || 0} />
        <GXScoreWidget score={gxScore} grade={gxGrade} />

        {/* Quick actions — full width */}
        <QuickActions />

        {/* Dynamic data widgets loaded on client */}
        <DashboardClientWrapper />
      </div>
    </div>
  );
}
