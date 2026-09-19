'use client';

import type { GXGradeBracket } from '@/lib/ai/types';
import { GRADE_BRACKETS } from '@/lib/ai/constants/grade-brackets';

interface GXScoreGradeBadgeProps {
  grade: GXGradeBracket;
}

const BADGE_STYLES: Record<string, string> = {
  exceptional: 'bg-cyan-500/10 text-cyan-400 border-cyan-400/30',
  strong: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30',
  developing: 'bg-amber-500/10 text-amber-400 border-amber-400/30',
  emerging: 'bg-orange-500/10 text-orange-400 border-orange-400/30',
  beginner: 'bg-red-500/10 text-red-400 border-red-400/30',
};

export function GXScoreGradeBadge({ grade }: GXScoreGradeBadgeProps) {
  const bracket = GRADE_BRACKETS.find(b => b.id === grade);
  const style = BADGE_STYLES[grade] || BADGE_STYLES.beginner;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
      {bracket?.label || 'Unknown'}
    </span>
  );
}
