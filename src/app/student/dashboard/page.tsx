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
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('first_name, last_name, profile_photo_url, profile_completion, gx_score, onboarding_status, user_id')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.onboarding_status !== 'complete') {
    redirect('/student/onboarding');
  }

  // Compute GX grade
  const gxScore = profile.gx_score || null;
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
          firstName={profile.first_name || 'Student'}
          profilePhotoUrl={profile.profile_photo_url}
        />

        {/* Profile completion + GX Score side by side */}
        <ProfileCompletionWidget completionPercentage={profile.profile_completion || 0} />
        <GXScoreWidget score={gxScore} grade={gxGrade} />

        {/* Quick actions — full width */}
        <QuickActions />

        {/* Dynamic data widgets loaded on client */}
        <DashboardClientWrapper />
      </div>
    </div>
  );
}
