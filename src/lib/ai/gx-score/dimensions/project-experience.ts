/**
 * Score Project Experience dimension.
 * Factors: count, complexity, recency, variety.
 */
export function scoreProjectExperience(profile: Record<string, unknown>): number {
  const projects = (profile.projects || profile.portfolio_items || []) as Array<{
    complexity?: string;
    type?: string;
    created_at?: string;
  }>;

  if (!projects || projects.length === 0) return 0;

  const PER_PROJECT_BASE = 10;
  const COMPLEXITY: Record<string, number> = { simple: 1, moderate: 1.5, complex: 2, advanced: 2.5 };

  let total = 0;
  const types = new Set<string>();

  for (const project of projects) {
    const complexity = COMPLEXITY[(project.complexity || 'moderate').toLowerCase()] || 1.5;
    let projectScore = PER_PROJECT_BASE * complexity;

    // Recency bonus
    if (project.created_at) {
      const monthsAgo = (Date.now() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsAgo < 6) projectScore *= 1.2;
    }

    total += projectScore;
    if (project.type) types.add(project.type);
  }

  // Variety bonus
  if (types.size >= 3) total += 10;
  else if (types.size >= 2) total += 5;

  return Math.min(100, Math.max(0, Math.round(total)));
}
