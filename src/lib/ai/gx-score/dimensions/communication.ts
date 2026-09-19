/**
 * Score Communication dimension.
 * Factors: languages, writing samples, presentation experience.
 */
export function scoreCommunication(profile: Record<string, unknown>): number {
  let score = 0;

  // Language proficiency (40% weight)
  const languages = (profile.languages || []) as Array<{ proficiency?: string; level?: string }>;
  const PROFICIENCY_SCALE: Record<string, number> = { A1: 10, A2: 25, B1: 40, B2: 60, C1: 80, C2: 100, native: 100 };

  if (languages.length > 0) {
    const avgProficiency = languages.reduce((sum, lang) => {
      const level = (lang.proficiency || lang.level || 'B1').toUpperCase();
      return sum + (PROFICIENCY_SCALE[level] || 40);
    }, 0) / languages.length;
    const languageBonus = Math.min(languages.length * 10, 30);
    score += Math.min(100, avgProficiency + languageBonus) * 0.4;
  } else {
    score += 20 * 0.4;
  }

  // Writing samples (30% weight)
  const hasWritingSamples = Boolean(profile.has_writing_samples || profile.bio);
  score += (hasWritingSamples ? 65 : 30) * 0.3;

  // Presentation experience (30% weight)
  const presentationCount = (profile.presentation_count as number) || 0;
  const presScore = Math.min(100, presentationCount * 25);
  score += presScore * 0.3;

  return Math.min(100, Math.max(0, Math.round(score)));
}
