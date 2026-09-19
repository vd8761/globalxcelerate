import type { DimensionScore } from '../types';

interface Skill {
  name: string;
  proficiency_level: number;
  verified?: boolean;
}

/**
 * Calculate skills dimension score using modified Jaccard with proficiency weighting.
 */
export function calculateSkillsScore(
  studentSkills: Skill[],
  requiredSkills: Skill[]
): DimensionScore {
  if (!requiredSkills || requiredSkills.length === 0) {
    return { score: 50, weight: 0, weighted_score: 0, label: 'Skills' };
  }

  if (!studentSkills || studentSkills.length === 0) {
    return { score: 0, weight: 0, weighted_score: 0, label: 'Skills' };
  }

  const studentSkillMap = new Map(
    studentSkills.map(s => [s.name.toLowerCase(), s])
  );

  let matchedWeightSum = 0;

  for (const required of requiredSkills) {
    const student = studentSkillMap.get(required.name.toLowerCase());
    if (!student) continue;

    const diff = student.proficiency_level - required.proficiency_level;
    let weight: number;

    if (diff >= 1) weight = 1.1; // Above requirement
    else if (diff === 0) weight = 1.0; // Exact match
    else if (diff === -1) weight = 0.7; // One below
    else weight = 0.4; // Two or more below

    matchedWeightSum += weight;
  }

  const extraSkills = studentSkills.filter(
    s => !requiredSkills.some(r => r.name.toLowerCase() === s.name.toLowerCase())
  );

  const denominator = requiredSkills.length + extraSkills.length * 0.1;
  const rawScore = (matchedWeightSum / denominator) * 100;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  return { score, weight: 0, weighted_score: 0, label: 'Skills' };
}
