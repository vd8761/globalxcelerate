/**
 * Score Leadership dimension.
 * Factors: leadership roles, team size, duration. Diminishing returns.
 */
export function scoreLeadership(profile: Record<string, unknown>): number {
  const experiences = (profile.experiences || profile.student_experiences || []) as Array<{
    type?: string;
    is_leadership?: boolean;
    team_size?: number;
    duration_months?: number;
  }>;

  const leadershipRoles = experiences.filter(e => e.is_leadership || e.type === 'leadership');

  if (leadershipRoles.length === 0) return 10;

  let score = 0;
  const DIMINISHING_FACTOR = 0.7;

  leadershipRoles.forEach((role, idx) => {
    let roleScore = 15; // Base score per role

    // Team size bonus
    const teamSize = role.team_size || 1;
    if (teamSize >= 20) roleScore += 15;
    else if (teamSize >= 10) roleScore += 10;
    else if (teamSize >= 5) roleScore += 5;

    // Duration multiplier
    const months = role.duration_months || 3;
    roleScore += Math.min(months * 0.5, 10);

    // Apply diminishing returns for subsequent roles
    score += roleScore * Math.pow(DIMINISHING_FACTOR, idx);
  });

  return Math.min(100, Math.max(0, Math.round(score)));
}
