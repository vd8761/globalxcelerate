import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { calculateGXScore } from '@/lib/ai/gx-score/calculate-gx-score';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'AUTH_001', message: 'Authentication required' } }, { status: 401 });
    }

    // Try to get existing score
    const { data: existingScore } = await supabase
      .from('gx_scores')
      .select('*')
      .eq('student_id', user.id)
      .single();

    if (existingScore) {
      return NextResponse.json({
        success: true,
        data: {
          composite_score: existingScore.composite_score,
          grade_bracket: existingScore.grade_bracket,
          dimensions: {
            academic_readiness: existingScore.academic_readiness,
            technical_skills: existingScore.technical_skills,
            communication: existingScore.communication,
            leadership: existingScore.leadership,
            project_experience: existingScore.project_experience,
            internship_experience: existingScore.internship_experience,
            international_exposure: existingScore.international_exposure,
            certifications: existingScore.certifications,
            portfolio_quality: existingScore.portfolio_quality,
            interview_readiness: existingScore.interview_readiness,
            languages: existingScore.languages,
            industry_skills: existingScore.industry_skills,
          },
          daily_change: existingScore.daily_change,
          anti_gaming_flagged: existingScore.anti_gaming_flagged,
          last_calculated_at: existingScore.last_calculated_at,
        },
      });
    }

    // Calculate initial score
    const newScore = await calculateGXScore(user.id, supabase, 'profile_update');

    return NextResponse.json({
      success: true,
      data: {
        composite_score: newScore.composite_score,
        grade_bracket: newScore.grade_bracket,
        dimensions: {
          academic_readiness: newScore.academic_readiness,
          technical_skills: newScore.technical_skills,
          communication: newScore.communication,
          leadership: newScore.leadership,
          project_experience: newScore.project_experience,
          internship_experience: newScore.internship_experience,
          international_exposure: newScore.international_exposure,
          certifications: newScore.certifications,
          portfolio_quality: newScore.portfolio_quality,
          interview_readiness: newScore.interview_readiness,
          languages: newScore.languages,
          industry_skills: newScore.industry_skills,
        },
        daily_change: newScore.daily_change,
        anti_gaming_flagged: newScore.anti_gaming_flagged,
        last_calculated_at: newScore.last_calculated_at,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SYS_001', message: 'Failed to fetch GX Score' } }, { status: 500 });
  }
}
