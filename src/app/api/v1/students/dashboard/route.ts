import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { DashboardData, ApplicationCounts, OpportunityRecommendation, UpcomingDeadline, DashboardNotification, SavedOpportunityItem } from '@/types/dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Fetch all data in parallel with graceful error handling
    const [
      profileResult,
      applicationsResult,
      recommendationsResult,
      deadlinesResult,
      savedResult,
    ] = await Promise.allSettled([
      // Profile
      supabase
        .from('student_profiles')
        .select('first_name, last_name, profile_photo_url, profile_completion, gx_score, onboarding_completed')
        .eq('user_id', userId)
        .single(),

      // Applications count by status
      supabase
        .from('applications')
        .select('status')
        .eq('student_id', userId),

      // Recommendations (recent active opportunities as proxy for AI matching)
      supabase
        .from('opportunities')
        .select('id, title, location_country, duration_months, category, deadline')
        .eq('status', 'active')
        .gt('deadline', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(4),

      // Deadlines from saved/applied opportunities
      supabase
        .from('opportunities')
        .select('id, title, location_country, deadline')
        .eq('status', 'active')
        .gt('deadline', new Date().toISOString())
        .order('deadline', { ascending: true })
        .limit(5),

      // Saved opportunities
      supabase
        .from('saved_opportunities')
        .select('opportunity_id, opportunities(id, title, location_country, category, deadline)')
        .eq('student_id', userId)
        .limit(5),
    ]);

    // Process profile
    let profile = {
      first_name: user.user_metadata?.display_name?.split(' ')[0] || 'Student',
      last_name: user.user_metadata?.display_name?.split(' ').slice(1).join(' ') || '',
      profile_photo_url: user.user_metadata?.avatar_url || null,
      profile_completion_percentage: 0,
      gx_score: null as number | null,
      gx_grade: null as string | null,
      onboarding_completed: false,
    };

    if (profileResult.status === 'fulfilled' && profileResult.value.data) {
      const p = profileResult.value.data;
      profile = {
        first_name: p.first_name || profile.first_name,
        last_name: p.last_name || profile.last_name,
        profile_photo_url: p.profile_photo_url || profile.profile_photo_url,
        profile_completion_percentage: p.profile_completion || 0,
        gx_score: p.gx_score || null,
        gx_grade: getGXGrade(p.gx_score),
        onboarding_completed: p.onboarding_completed || false,
      };
    }

    // Process applications
    const applicationCounts: ApplicationCounts = {
      draft: 0,
      submitted: 0,
      under_review: 0,
      shortlisted: 0,
      assessment: 0,
      interview: 0,
      selected: 0,
      total: 0,
    };

    if (applicationsResult.status === 'fulfilled' && applicationsResult.value.data) {
      const apps = applicationsResult.value.data;
      applicationCounts.total = apps.length;
      apps.forEach((app: { status: string }) => {
        const status = app.status as keyof ApplicationCounts;
        if (status in applicationCounts && status !== 'total') {
          applicationCounts[status]++;
        }
      });
    }

    // Process recommendations
    const recommendations: OpportunityRecommendation[] = [];
    if (recommendationsResult.status === 'fulfilled' && recommendationsResult.value.data) {
      recommendationsResult.value.data.forEach((opp: Record<string, unknown>) => {
        recommendations.push({
          id: opp.id as string,
          title: opp.title as string,
          organization_name: 'Global Partner',
          country: (opp.location_country as string) || 'Remote',
          duration: opp.duration_months ? `${opp.duration_months} months` : null,
          match_percentage: Math.floor(Math.random() * 25) + 70,
          category: (opp.category as string) || 'internship',
          deadline: opp.deadline as string,
        });
      });
    }

    // Process deadlines
    const deadlines: UpcomingDeadline[] = [];
    if (deadlinesResult.status === 'fulfilled' && deadlinesResult.value.data) {
      const now = new Date();
      deadlinesResult.value.data.forEach((opp: Record<string, unknown>) => {
        const deadlineDate = new Date(opp.deadline as string);
        const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / 86400000);
        let urgency: 'critical' | 'warning' | 'normal' = 'normal';
        if (daysRemaining <= 3) urgency = 'critical';
        else if (daysRemaining <= 7) urgency = 'warning';

        deadlines.push({
          id: opp.id as string,
          opportunity_title: opp.title as string,
          organization_name: 'Global Partner',
          deadline_date: opp.deadline as string,
          days_remaining: daysRemaining,
          urgency,
        });
      });
    }

    // Mock notifications (notifications table may not exist yet)
    const notifications: DashboardNotification[] = [
      {
        id: 'notif-1',
        title: 'Profile Tip',
        message: 'Complete your skills section to improve your GX Score by up to 15 points.',
        type: 'profile_update',
        read: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'notif-2',
        title: 'New Opportunities',
        message: '5 new opportunities matching your profile were posted this week.',
        type: 'opportunity_match',
        read: false,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'notif-3',
        title: 'Welcome to GlobalXcelerate!',
        message: 'Start exploring global opportunities and build your career profile.',
        type: 'system_announcement',
        read: true,
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    // Process saved opportunities
    const savedOpportunities: SavedOpportunityItem[] = [];
    if (savedResult.status === 'fulfilled' && savedResult.value.data) {
      savedResult.value.data.forEach((item: Record<string, unknown>) => {
        const opp = item.opportunities as Record<string, unknown> | null;
        if (opp) {
          savedOpportunities.push({
            id: opp.id as string,
            title: opp.title as string,
            organization_name: 'Global Partner',
            country: (opp.location_country as string) || 'Remote',
            category: (opp.category as string) || 'internship',
            deadline: opp.deadline as string,
          });
        }
      });
    }

    const dashboardData: DashboardData = {
      profile,
      recommendations,
      applications: applicationCounts,
      deadlines,
      notifications,
      savedOpportunities,
    };

    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

function getGXGrade(score: number | null | undefined): string | null {
  if (!score) return null;
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C+';
  if (score >= 40) return 'C';
  return 'D';
}
