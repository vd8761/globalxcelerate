'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface GXScoreChangeIndicatorProps {
  delta: number;
}

export function GXScoreChangeIndicator({ delta }: GXScoreChangeIndicatorProps) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
        <Minus className="h-3 w-3" />
        0
      </span>
    );
  }

  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
        <TrendingUp className="h-3 w-3" />
        +{delta.toFixed(1)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-600 bg-red-50 rounded-full px-2 py-0.5">
      <TrendingDown className="h-3 w-3" />
      {delta.toFixed(1)}
    </span>
  );
}
