import type { SkillGap } from '../types';

interface Skill {
  name: string;
  proficiency_level: number;
  is_required?: boolean;
}

/**
 * Analyze skill gaps between student's skills and opportunity requirements.
 */
export function analyzeSkillGaps(
  studentSkills: Array<{ name: string; proficiency_level: number }>,
  requiredSkills: Skill[]
): SkillGap[] {
  if (!requiredSkills || requiredSkills.length === 0) return [];

  const studentMap = new Map(
    (studentSkills || []).map(s => [s.name.toLowerCase(), s])
  );

  const gaps: SkillGap[] = [];

  for (const required of requiredSkills) {
    const student = studentMap.get(required.name.toLowerCase());

    if (!student) {
      // Skill completely missing
      gaps.push({
        skill_name: required.name,
        priority: required.is_required !== false ? 'high' : 'low',
        proficiency_required: required.proficiency_level,
        proficiency_current: null,
      });
    } else if (student.proficiency_level < required.proficiency_level) {
      // Skill present but below required level
      gaps.push({
        skill_name: required.name,
        priority: required.is_required !== false ? 'medium' : 'low',
        proficiency_required: required.proficiency_level,
        proficiency_current: student.proficiency_level,
      });
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return gaps;
}
