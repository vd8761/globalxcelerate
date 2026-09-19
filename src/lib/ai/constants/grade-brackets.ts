import type { GradeBracket, GXGradeBracket } from '../types';

export const GRADE_BRACKETS: GradeBracket[] = [
  { id: 'exceptional', min: 85, max: 100, label: 'Exceptional', color: 'cyan-500' },
  { id: 'strong', min: 70, max: 84, label: 'Strong', color: 'emerald-500' },
  { id: 'developing', min: 50, max: 69, label: 'Developing', color: 'amber-500' },
  { id: 'emerging', min: 30, max: 49, label: 'Emerging', color: 'orange-500' },
  { id: 'beginner', min: 0, max: 29, label: 'Beginner', color: 'red-500' },
];

export function getGradeBracket(score: number): GradeBracket {
  const clamped = Math.max(0, Math.min(100, score));
  const bracket = GRADE_BRACKETS.find(b => clamped >= b.min && clamped <= b.max);
  return bracket || GRADE_BRACKETS[GRADE_BRACKETS.length - 1];
}

export function getGradeColor(grade: GXGradeBracket): string {
  const bracket = GRADE_BRACKETS.find(b => b.id === grade);
  return bracket?.color || 'gray-500';
}
