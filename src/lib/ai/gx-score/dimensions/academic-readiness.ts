/**
 * Score Academic Readiness dimension.
 * Factors: GPA, degree level, field relevance.
 */
export function scoreAcademicReadiness(profile: Record<string, unknown>): number {
  let score = 0;

  // GPA component (50% weight)
  const gpa = profile.gpa as number | undefined;
  const gpaScale = (profile.gpa_scale as number) || 4.0;
  if (gpa != null) {
    score += (gpa / gpaScale) * 100 * 0.5;
  } else {
    score += 20; // Default if no GPA
  }

  // Degree level (30% weight)
  const degreeLevel = (profile.degree_level as string)?.toLowerCase();
  const degreeBonus: Record<string, number> = { phd: 100, masters: 80, bachelors: 55, associate: 35 };
  score += (degreeBonus[degreeLevel || ''] || 30) * 0.3;

  // Field relevance (20% weight)
  const hasFieldOfStudy = Boolean(profile.field_of_study);
  score += (hasFieldOfStudy ? 70 : 40) * 0.2;

  return Math.min(100, Math.max(0, Math.round(score)));
}
