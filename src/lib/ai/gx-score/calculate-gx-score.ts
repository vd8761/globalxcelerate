import type { SupabaseClient } from '@supabase/supabase-js';
import type { GXScore, ScoreTriggerType } from '../types';
import { scoreAcademicReadiness } from './dimensions/academic-readiness';
import { scoreTechnicalSkills } from './dimensions/technical-skills';
import { scoreCommunication } from './dimensions/communication';
import { scoreLeadership } from './dimensions/leadership';
import { scoreProjectExperience } from './dimensions/project-experience';
import { scoreInternshipExperience } from './dimensions/internship-experience';
import { scoreInternationalExposure } from './dimensions/international-exposure';
import { scoreCertifications } from './dimensions/certifications';
import { scorePortfolioQuality } from './dimensions/portfolio-quality';
import { scoreInterviewReadiness } from './dimensions/interview-readiness';
import { scoreLanguages } from './dimensions/languages';
import { scoreIndustrySkills } from './dimensions/industry-skills';
import { enforceAntiGaming } from './anti-gaming-guard';
import { resolveGradeBracket } from './grade-bracket-resolver';
import { recordScoreHistory } from './history-tracker';

/**
 * Main orchestrator: Calculate and persist the GX Score for a student.
 */
export async function calculateGXScore(
  studentId: string,
  supabase: SupabaseClient,
  triggerType: ScoreTriggerType = 'profile_update'
): Promise<GXScore> {
  // 1. Fetch full student profile with related data
  const { data: profile, error: profileError } = await supabase
    .from('student_profiles')
    .select('*, student_skills(*), student_experiences(*), student_education(*), portfolio_items(*)')
    .eq('user_id', studentId)
    .single();

  if (profileError || !profile) {
    throw new Error(`Student profile not found for user ${studentId}`);
  }

  // Build a flat profile object for dimension scorers
  const flatProfile: Record<string, unknown> = {
    ...profile,
    skills: profile.student_skills,
    student_skills: profile.student_skills,
    experiences: profile.student_experiences,
    student_experiences: profile.student_experiences,
    portfolio_items: profile.portfolio_items,
    projects: profile.portfolio_items,
    education: profile.student_education,
  };

  // 2. Run all 12 dimension scorers
  const dimensionScores: Record<string, number> = {
    academic_readiness: scoreAcademicReadiness(flatProfile),
    technical_skills: scoreTechnicalSkills(flatProfile),
    communication: scoreCommunication(flatProfile),
    leadership: scoreLeadership(flatProfile),
    project_experience: scoreProjectExperience(flatProfile),
    internship_experience: scoreInternshipExperience(flatProfile),
    international_exposure: scoreInternationalExposure(flatProfile),
    certifications: scoreCertifications(flatProfile),
    portfolio_quality: scorePortfolioQuality(flatProfile),
    interview_readiness: scoreInterviewReadiness(flatProfile),
    languages: scoreLanguages(flatProfile),
    industry_skills: scoreIndustrySkills(flatProfile),
  };

  // 3. Compute composite (average of all 12)
  const scores = Object.values(dimensionScores);
  const rawComposite = scores.reduce((sum, s) => sum + s, 0) / scores.length;

  // 4. Resolve grade bracket
  const gradeBracket = resolveGradeBracket(rawComposite);

  // 5. Fetch previous score for anti-gaming check
  const { data: existingScore } = await supabase
    .from('gx_scores')
    .select('composite_score, daily_change')
    .eq('student_id', studentId)
    .single();

  const previousScore = existingScore?.composite_score || 0;
  const dailyChangeApplied = existingScore?.daily_change || 0;

  // 6. Enforce anti-gaming
  const { cappedScore, capped } = enforceAntiGaming(
    previousScore,
    rawComposite,
    Math.abs(dailyChangeApplied)
  );

  const now = new Date().toISOString();
  const dailyChange = cappedScore - previousScore;

  // 7. Upsert gx_scores table
  const scoreRecord = {
    student_id: studentId,
    composite_score: Math.round(cappedScore * 100) / 100,
    grade_bracket: gradeBracket,
    academic_readiness: dimensionScores.academic_readiness,
    technical_skills: dimensionScores.technical_skills,
    communication: dimensionScores.communication,
    leadership: dimensionScores.leadership,
    project_experience: dimensionScores.project_experience,
    internship_experience: dimensionScores.internship_experience,
    international_exposure: dimensionScores.international_exposure,
    certifications: dimensionScores.certifications,
    portfolio_quality: dimensionScores.portfolio_quality,
    interview_readiness: dimensionScores.interview_readiness,
    languages: dimensionScores.languages,
    industry_skills: dimensionScores.industry_skills,
    daily_change: Math.round(dailyChange * 100) / 100,
    anti_gaming_flagged: capped,
    last_calculated_at: now,
    updated_at: now,
  };

  await supabase
    .from('gx_scores')
    .upsert(scoreRecord, { onConflict: 'student_id' });

  // 8. Record history
  await recordScoreHistory(
    studentId,
    cappedScore,
    previousScore,
    triggerType,
    null,
    capped,
    dimensionScores,
    supabase
  );

  // 9. Update student profile gx_score field
  await supabase
    .from('student_profiles')
    .update({ gx_score: Math.round(cappedScore * 100) / 100 })
    .eq('user_id', studentId);

  return {
    id: crypto.randomUUID(),
    student_id: studentId,
    composite_score: Math.round(cappedScore * 100) / 100,
    grade_bracket: gradeBracket,
    ...dimensionScores,
    daily_change: Math.round(dailyChange * 100) / 100,
    anti_gaming_flagged: capped,
    last_calculated_at: now,
    created_at: now,
    updated_at: now,
  } as GXScore;
}
