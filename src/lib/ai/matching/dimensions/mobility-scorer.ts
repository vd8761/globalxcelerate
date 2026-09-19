import type { DimensionScore } from '../types';

interface StudentProfile {
  international_experiences_count?: number;
  languages?: Array<{ name: string; proficiency?: string }>;
}

interface OpportunityForMobility {
  location_country?: string;
  language_required?: string;
}

/**
 * Calculate mobility dimension score based on international exposure and language proficiency.
 */
export function calculateMobilityScore(
  studentProfile: StudentProfile,
  opportunity: OpportunityForMobility
): DimensionScore {
  const expCount = studentProfile.international_experiences_count || 0;

  // Base score from international experiences
  let score: number;
  if (expCount >= 3) score = 90;
  else if (expCount === 2) score = 70;
  else if (expCount === 1) score = 50;
  else score = 30;

  // Language bonus: +10 if speaks destination country language
  if (opportunity.language_required && studentProfile.languages) {
    const speaksLanguage = studentProfile.languages.some(
      lang => lang.name.toLowerCase() === opportunity.language_required!.toLowerCase()
    );
    if (speaksLanguage) {
      score = Math.min(100, score + 10);
    }
  }

  return { score: Math.min(100, score), weight: 0, weighted_score: 0, label: 'Mobility' };
}
