/**
 * Score International Exposure dimension.
 * Factors: countries, duration, study abroad, international certifications.
 */
export function scoreInternationalExposure(profile: Record<string, unknown>): number {
  const countriesCount = (profile.international_experiences_count as number) ||
    (profile.countries_visited as number) || 0;
  const hasStudyAbroad = Boolean(profile.has_study_abroad || profile.study_abroad);
  const internationalCerts = (profile.international_certifications_count as number) || 0;

  if (countriesCount === 0 && !hasStudyAbroad && internationalCerts === 0) return 5;

  let score = 0;

  // Per country base (15 per country, diminishing)
  for (let i = 0; i < Math.min(countriesCount, 6); i++) {
    score += 15 * Math.pow(0.85, i);
  }

  // Study abroad bonus
  if (hasStudyAbroad) score += 20;

  // International certifications
  score += Math.min(internationalCerts * 10, 20);

  return Math.min(100, Math.max(0, Math.round(score)));
}
