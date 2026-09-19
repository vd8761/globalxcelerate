/**
 * Score Industry Skills dimension.
 * Factors: alignment with high-demand skills, market relevance.
 */
const HIGH_DEMAND_SKILLS = [
  'ai/ml', 'machine learning', 'artificial intelligence',
  'cloud computing', 'aws', 'azure', 'gcp',
  'data science', 'data analytics',
  'cybersecurity', 'information security',
  'blockchain', 'web3',
  'devops', 'ci/cd',
  'ux design', 'ui/ux',
  'product management',
  'react', 'next.js', 'typescript',
  'python', 'golang',
];

export function scoreIndustrySkills(profile: Record<string, unknown>): number {
  const skills = (profile.skills || profile.student_skills || []) as Array<{
    name?: string;
    skill_name?: string;
    proficiency_level?: number;
  }>;

  if (!skills || skills.length === 0) return 0;

  const ALIGNMENT_BASE = 8;
  const HIGH_DEMAND_MULTIPLIER = 1.5;
  let total = 0;

  for (const skill of skills) {
    const name = ((skill.name || skill.skill_name || '').toLowerCase());
    let skillScore = ALIGNMENT_BASE;

    if (HIGH_DEMAND_SKILLS.some(hd => name.includes(hd) || hd.includes(name))) {
      skillScore *= HIGH_DEMAND_MULTIPLIER;
    }

    // Proficiency level bonus
    const proficiency = skill.proficiency_level || 1;
    skillScore *= (0.5 + proficiency * 0.2);

    total += skillScore;
  }

  // Market relevance bonus (10 if > 5 high-demand skills)
  const highDemandCount = skills.filter(s => {
    const name = (s.name || s.skill_name || '').toLowerCase();
    return HIGH_DEMAND_SKILLS.some(hd => name.includes(hd) || hd.includes(name));
  }).length;
  if (highDemandCount >= 5) total += 10;

  return Math.min(100, Math.max(0, Math.round(total)));
}
