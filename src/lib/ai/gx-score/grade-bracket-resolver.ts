import { GRADE_BRACKETS } from '../constants/grade-brackets';
import type { GXGradeBracket } from '../types';

/**
 * Resolve grade bracket from composite score.
 */
export function resolveGradeBracket(compositeScore: number): GXGradeBracket {
  const score = Math.max(0, Math.min(100, compositeScore));

  if (score >= 85) return 'exceptional';
  if (score >= 70) return 'strong';
  if (score >= 50) return 'developing';
  if (score >= 30) return 'emerging';
  return 'beginner';
}
