import type { MatchGrade } from '@/types/marketplace';
import { MATCH_SCORE_COLORS } from './constants';

export function getMatchGrade(score: number): MatchGrade {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'low';
}

export function getMatchColorClasses(score: number): string {
  const tier = MATCH_SCORE_COLORS.find((t) => score >= t.min);
  return tier ? `bg-gradient-to-r ${tier.gradient}` : 'bg-gray-300';
}

export function getMatchBgClass(score: number): string {
  const tier = MATCH_SCORE_COLORS.find((t) => score >= t.min);
  return tier?.bg || 'bg-gray-50';
}

export function getMatchTextClass(score: number): string {
  const tier = MATCH_SCORE_COLORS.find((t) => score >= t.min);
  return tier?.text || 'text-gray-600';
}

export function getMatchLabel(grade: MatchGrade): string {
  switch (grade) {
    case 'excellent': return 'Excellent Match';
    case 'good': return 'Good Match';
    case 'fair': return 'Fair Match';
    case 'low': return 'Low Match';
  }
}
