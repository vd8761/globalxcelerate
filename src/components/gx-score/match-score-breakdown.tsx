'use client';

import { useMemo } from 'react';
import type { MatchDimensions } from '@/lib/ai/types';

interface MatchScoreBreakdownProps {
  dimensions: MatchDimensions;
}

function getBarColor(score: number): string {
  if (score >= 75) return 'bg-cyan-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

export function MatchScoreBreakdown({ dimensions }: MatchScoreBreakdownProps) {
  const sorted = useMemo(() => {
    return Object.entries(dimensions)
      .map(([key, dim]) => ({ key, ...dim }))
      .sort((a, b) => b.weighted_score - a.weighted_score);
  }, [dimensions]);

  return (
    <div className="space-y-3">
      {sorted.map((dim) => (
        <div key={dim.key} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 capitalize">{dim.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                {Math.round(dim.weight * 100)}%
              </span>
              <span className="text-sm font-bold text-slate-900">{Math.round(dim.score)}</span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${getBarColor(dim.score)} transition-all duration-700 ease-out`}
              style={{ width: `${Math.min(dim.score, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
