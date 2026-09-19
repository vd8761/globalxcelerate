/**
 * Score Interview Readiness dimension.
 * Factors: mock interviews, assessments, related certifications, profile completeness.
 */
export function scoreInterviewReadiness(profile: Record<string, unknown>): number {
  let score = 0;

  // Mock interviews (20 pts each, max 2)
  const mockInterviews = (profile.mock_interviews_completed as number) || 0;
  score += Math.min(mockInterviews, 2) * 20;

  // Assessment scores (40% weight)
  const assessmentScore = (profile.assessment_score as number) || 0;
  score += (assessmentScore / 100) * 40;

  // Certifications in interview-adjacent skills
  const hasCerts = Boolean(profile.has_interview_certs || profile.certifications_count);
  if (hasCerts) score += 10;

  // Profile completeness (30% weight)
  const completeness = (profile.profile_completion as number) || 50;
  score += (completeness / 100) * 30;

  return Math.min(100, Math.max(0, Math.round(score)));
}
