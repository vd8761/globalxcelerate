import type { SupabaseClient } from '@supabase/supabase-js';
import type { MatchCalculationResult, MatchDimensions } from '../types';
import { calculateSkillsScore } from './dimensions/skills-scorer';
import { calculateAcademicScore } from './dimensions/academic-scorer';
import { calculateExperienceScore } from './dimensions/experience-scorer';
import { calculateGeographyScore } from './dimensions/geography-scorer';
import { calculateAvailabilityScore } from './dimensions/availability-scorer';
import { calculateMobilityScore } from './dimensions/mobility-scorer';
import { resolveWeights } from './weight-resolver';
import { analyzeSkillGaps } from './skill-gap-analyzer';
import { getCachedScore, cacheScore } from './cache-manager';

interface CalculateOptions {
  force_recalculate?: boolean;
}

/**
 * Main orchestrator: Calculate match score between a student and an opportunity.
 */
export async function calculateMatchScore(
  studentId: string,
  opportunityId: string,
  supabase: SupabaseClient,
  options: CalculateOptions = {}
): Promise<MatchCalculationResult> {
  // 1. Check cache
  if (!options.force_recalculate) {
    const cached = await getCachedScore(studentId, opportunityId, supabase);
    if (cached) {
      return {
        student_id: studentId,
        opportunity_id: opportunityId,
        composite_score: cached.composite_score,
        dimensions: cached.dimension_scores as unknown as MatchDimensions,
        skill_gaps: cached.skill_gaps as unknown as MatchCalculationResult['skill_gaps'],
        explanation: cached.explanation_text || undefined,
        from_cache: true,
        calculated_at: cached.calculated_at,
        expires_at: cached.expires_at,
      };
    }
  }

  // 2. Fetch student profile
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*, student_skills(*), student_experiences(*), student_education(*)')
    .eq('user_id', studentId)
    .single();

  if (!profile) {
    throw new Error(`Student profile not found for user ${studentId}`);
  }

  // 3. Fetch opportunity
  const { data: opportunity } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', opportunityId)
    .single();

  if (!opportunity) {
    throw new Error(`Opportunity not found: ${opportunityId}`);
  }

  // 4. Resolve weights
  const weights = resolveWeights(opportunity.category);

  // 5. Run dimension scorers
  const studentSkills = (profile.student_skills || []).map((s: Record<string, unknown>) => ({
    name: s.skill_name as string || s.name as string || '',
    proficiency_level: (s.proficiency_level as number) || 1,
  }));

  const requiredSkills = (opportunity.requirements?.skills || []).map((s: Record<string, unknown>) => ({
    name: (s.name as string) || '',
    proficiency_level: (s.proficiency_level as number) || 3,
    is_required: true,
  }));

  const skills = calculateSkillsScore(studentSkills, requiredSkills);
  const academic = calculateAcademicScore(
    { gpa: profile.gpa, field_of_study: profile.field_of_study },
    { gpa_min: opportunity.requirements?.gpa_min, field_of_study: opportunity.requirements?.field_of_study }
  );
  const experience = calculateExperienceScore(
    profile.student_experiences || [],
    opportunity
  );
  const geography = calculateGeographyScore(
    { current_country: profile.current_country, current_city: profile.current_city },
    { visa_eligible_countries: profile.visa_eligible_countries },
    { location_country: opportunity.location_country, location_city: opportunity.location_city, visa_support: opportunity.visa_support }
  );
  const availability = calculateAvailabilityScore(
    { available_from: profile.available_from, available_to: profile.available_to },
    { start_date: opportunity.start_date, duration_months: opportunity.duration_months }
  );
  const mobility = calculateMobilityScore(
    { international_experiences_count: profile.international_experiences_count, languages: profile.languages },
    { location_country: opportunity.location_country }
  );

  // 6. Compute weighted composite
  const dimensions: MatchDimensions = {
    skills: { ...skills, weight: weights.skills, weighted_score: skills.score * weights.skills },
    academic: { ...academic, weight: weights.academic, weighted_score: academic.score * weights.academic },
    experience: { ...experience, weight: weights.experience, weighted_score: experience.score * weights.experience },
    geography: { ...geography, weight: weights.geography, weighted_score: geography.score * weights.geography },
    availability: { ...availability, weight: weights.availability, weighted_score: availability.score * weights.availability },
    mobility: { ...mobility, weight: weights.mobility, weighted_score: mobility.score * weights.mobility },
  };

  const compositeScore = Object.values(dimensions).reduce((sum, d) => sum + d.weighted_score, 0);

  // 7. Analyze skill gaps
  const skillGaps = analyzeSkillGaps(studentSkills, requiredSkills);

  // 8. Cache result
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await cacheScore(
    {
      student_id: studentId,
      opportunity_id: opportunityId,
      composite_score: Math.round(compositeScore * 100) / 100,
      dimension_scores: dimensions as unknown as Record<string, unknown>,
      skill_gaps: skillGaps as unknown as Array<Record<string, unknown>>,
    },
    supabase
  );

  // 9. Return result
  return {
    student_id: studentId,
    opportunity_id: opportunityId,
    composite_score: Math.round(compositeScore * 100) / 100,
    dimensions,
    skill_gaps: skillGaps,
    from_cache: false,
    calculated_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  };
}
