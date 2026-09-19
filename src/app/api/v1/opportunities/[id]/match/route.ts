import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID();

  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Require authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: 'Authentication required' }, meta: { request_id: requestId } },
        { status: 401 }
      );
    }

    // Get student profile
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.profile_completion < 30) {
      return NextResponse.json(
        { success: false, error: { code: 'BIZ_001', message: 'Profile too incomplete for matching. Complete at least 30% of your profile.' }, meta: { request_id: requestId } },
        { status: 403 }
      );
    }

    // Check for cached score
    const { data: cachedScore } = await supabase
      .from('match_scores')
      .select('*')
      .eq('student_id', profile.id)
      .eq('opportunity_id', id)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    if (cachedScore) {
      return NextResponse.json({
        success: true,
        data: {
          overall_score: cachedScore.total_score,
          grade: getGrade(cachedScore.total_score),
          dimensions: cachedScore.dimension_scores,
          explanation: cachedScore.explanation || 'Based on your profile and the opportunity requirements.',
          strengths: cachedScore.strengths || [],
          gaps: cachedScore.gaps || [],
          computed_at: cachedScore.computed_at,
        },
        meta: { request_id: requestId },
      });
    }

    // Get opportunity with requirements
    const { data: opportunity } = await supabase
      .from('opportunities')
      .select(`
        requirements, category, industry, location_country,
        opportunity_skills(skill_id, importance, min_proficiency, skills_master(name))
      `)
      .eq('id', id)
      .single();

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: { code: 'RES_001', message: 'Opportunity not found' }, meta: { request_id: requestId } },
        { status: 404 }
      );
    }

    // Get student skills
    const { data: studentSkills } = await supabase
      .from('student_skills')
      .select('proficiency_level, skills_master(name)')
      .eq('student_id', profile.id);

    // Compute match score
    const requirements = opportunity.requirements as any || {};
    const dimensions = computeMatchDimensions(profile, studentSkills || [], opportunity, requirements);
    const totalScore = dimensions.reduce((sum, d) => sum + d.score, 0) / Math.max(dimensions.length, 1);
    const roundedScore = Math.round(totalScore * 10) / 10;

    const strengths: string[] = [];
    const gaps: string[] = [];
    dimensions.forEach((d) => {
      if (d.score >= 70) strengths.push(`Strong ${d.name.toLowerCase()} alignment`);
      else if (d.score < 50) gaps.push(`${d.name} could be improved`);
    });

    // Cache the result
    await supabase.from('match_scores').upsert({
      student_id: profile.id,
      opportunity_id: id,
      total_score: roundedScore,
      dimension_scores: dimensions,
      explanation: `Your profile matches ${roundedScore}% with this opportunity based on skills, education, and experience.`,
      strengths,
      gaps,
      computed_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: 'student_id,opportunity_id' });

    return NextResponse.json({
      success: true,
      data: {
        overall_score: roundedScore,
        grade: getGrade(roundedScore),
        dimensions,
        explanation: `Your profile matches ${roundedScore}% with this opportunity based on skills, education, and experience.`,
        strengths,
        gaps,
        computed_at: new Date().toISOString(),
      },
      meta: { request_id: requestId },
    });
  } catch (err) {
    console.error('Match score error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SYS_001', message: 'Match computation failed' }, meta: { request_id: requestId } },
      { status: 503, headers: { 'Retry-After': '60' } }
    );
  }
}

function getGrade(score: number): string {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'low';
}

function computeMatchDimensions(profile: any, studentSkills: any[], opportunity: any, requirements: any) {
  const dimensions = [];

  // Skills match
  const requiredSkills = (opportunity.opportunity_skills || [])
    .filter((s: any) => s.importance === 'required')
    .map((s: any) => s.skills_master?.name?.toLowerCase());
  const studentSkillNames = studentSkills.map((s: any) => s.skills_master?.name?.toLowerCase());
  const skillMatches = requiredSkills.filter((s: string) => studentSkillNames.includes(s));
  const skillScore = requiredSkills.length > 0 ? (skillMatches.length / requiredSkills.length) * 100 : 75;
  dimensions.push({ name: 'Skills', score: Math.round(skillScore), max: 100, weight: 0.3 });

  // Education match
  let eduScore = 60;
  if (requirements.min_gpa && profile.gpa) {
    eduScore = profile.gpa >= requirements.min_gpa ? 90 : (profile.gpa / requirements.min_gpa) * 80;
  }
  if (requirements.fields_of_study?.length && profile.field_of_study) {
    const fieldMatch = requirements.fields_of_study.some(
      (f: string) => f.toLowerCase() === profile.field_of_study?.toLowerCase()
    );
    if (fieldMatch) eduScore = Math.min(100, eduScore + 20);
  }
  dimensions.push({ name: 'Education', score: Math.round(Math.min(100, eduScore)), max: 100, weight: 0.25 });

  // Experience match
  let expScore = 60;
  if (requirements.min_experience_months && profile.experience_months) {
    expScore = profile.experience_months >= requirements.min_experience_months
      ? 90
      : (profile.experience_months / requirements.min_experience_months) * 80;
  }
  dimensions.push({ name: 'Experience', score: Math.round(Math.min(100, expScore)), max: 100, weight: 0.2 });

  // Location fit
  let locScore = 70;
  if (profile.current_country === opportunity.location_country) locScore = 95;
  dimensions.push({ name: 'Location', score: locScore, max: 100, weight: 0.15 });

  // Career alignment
  const careerScore = 65; // Default when career goals aren't detailed enough
  dimensions.push({ name: 'Career Fit', score: careerScore, max: 100, weight: 0.1 });

  return dimensions;
}
