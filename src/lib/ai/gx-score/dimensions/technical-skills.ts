/**
 * Score Technical Skills dimension.
 * Formula: per_skill_base(5) × proficiency_multiplier, verified bonus.
 */
export function scoreTechnicalSkills(profile: Record<string, unknown>): number {
  const skills = (profile.skills || profile.student_skills || []) as Array<{
    proficiency_level?: number;
    verified?: boolean;
  }>;

  if (!skills || skills.length === 0) return 0;

  const PER_SKILL_BASE = 5;
  const PROFICIENCY_MULTIPLIER: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };
  const VERIFIED_BONUS = 1.5;
  const MAX_SKILLS = 20;

  let total = 0;
  const counted = skills.slice(0, MAX_SKILLS);

  for (const skill of counted) {
    const proficiency = skill.proficiency_level || 1;
    const multiplier = PROFICIENCY_MULTIPLIER[proficiency] || 1;
    let skillScore = PER_SKILL_BASE * multiplier;
    if (skill.verified) skillScore *= VERIFIED_BONUS;
    total += skillScore;
  }

  return Math.min(100, Math.max(0, Math.round(total)));
}
