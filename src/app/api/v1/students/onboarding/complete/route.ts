import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Check mandatory steps completed
    const stepStatuses = user.user_metadata?.step_statuses ?? {};
    const mandatorySteps = ['identity', 'education', 'skills'];
    const incompleteSteps = mandatorySteps.filter((s) => stepStatuses[s] !== 'completed');

    if (incompleteSteps.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ONBOARDING_INCOMPLETE',
            message: 'All mandatory steps must be completed',
            details: incompleteSteps.map((s) => ({ field: s, message: `Step "${s}" is not completed` })),
          },
        },
        { status: 400 }
      );
    }

    // Get profile data for score calculation
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get skills count
    const { count: skillsCount } = await supabase
      .from('student_skills')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', profile?.id ?? '');

    // Calculate GX Score (simplified formula)
    const academicStrength = profile?.gpa ? Math.min((profile.gpa / 4.0) * 25, 25) : 10;
    const skillsDepth = Math.min(((skillsCount ?? 0) / 12) * 25, 25);
    const experienceBreadth = Math.min(((profile?.experience_months ?? 0) / 24) * 20, 20);
    const globalReadiness = (profile?.languages as unknown[])?.length ? Math.min((profile.languages as unknown[]).length * 5, 15) : 5;
    const profileQuality = Math.min(((profile?.profile_completion ?? 0) / 100) * 15, 15);

    const gxScore = Math.round(academicStrength + skillsDepth + experienceBreadth + globalReadiness + profileQuality);

    let gxGrade = 'Beginner';
    if (gxScore >= 90) gxGrade = 'Exceptional';
    else if (gxScore >= 75) gxGrade = 'Strong';
    else if (gxScore >= 50) gxGrade = 'Developing';
    else if (gxScore >= 25) gxGrade = 'Emerging';

    const gxScoreDimensions = {
      academic_strength: Math.round(academicStrength),
      skills_depth: Math.round(skillsDepth),
      experience_breadth: Math.round(experienceBreadth),
      global_readiness: Math.round(globalReadiness),
      profile_quality: Math.round(profileQuality),
    };

    // Generate improvement tips
    const tips: { category: string; message: string; priority: number }[] = [];
    if (academicStrength < 20) tips.push({ category: 'academic', message: 'Add your GPA to strengthen your academic score', priority: 1 });
    if (skillsDepth < 15) tips.push({ category: 'skills', message: 'Add more skills with accurate proficiency levels', priority: 2 });
    if (experienceBreadth < 10) tips.push({ category: 'experience', message: 'Add internships or project experiences to boost your profile', priority: 3 });
    if (globalReadiness < 10) tips.push({ category: 'global', message: 'Add languages and global preferences for better opportunities', priority: 4 });
    if (profileQuality < 10) tips.push({ category: 'profile', message: 'Complete optional sections to improve profile quality', priority: 5 });

    // Generate profile slug
    const firstName = (profile?.first_name ?? 'user').toLowerCase().replace(/[^a-z]/g, '');
    const lastName = (profile?.last_name ?? 'profile').toLowerCase().replace(/[^a-z]/g, '');
    const randomChars = Math.random().toString(36).substring(2, 6);
    const profileSlug = `${firstName}-${lastName}-${randomChars}`;

    // Update profile
    await supabase
      .from('student_profiles')
      .update({
        onboarding_status: 'complete',
        gx_score: gxScore,
        profile_completion: Math.round((Object.values(gxScoreDimensions).reduce((a, b) => a + b, 0) / 100) * 100),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    // Update user metadata
    await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
        onboarding_step: 8,
        gx_score: gxScore,
        gx_grade: gxGrade,
        profile_slug: profileSlug,
        step_statuses: { ...stepStatuses, complete: 'completed' },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        gx_score: gxScore,
        gx_grade: gxGrade,
        gx_score_dimensions: gxScoreDimensions,
        improvement_tips: tips,
        profile_slug: profileSlug,
        redirect_url: '/dashboard',
      },
      meta: { request_id: crypto.randomUUID(), timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Onboarding complete error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
