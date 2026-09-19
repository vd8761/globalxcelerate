'use client';

import { GXScoreGradeBadge } from './gx-score-grade-badge';
import { GXScoreChangeIndicator } from './gx-score-change-indicator';
import type { GXGradeBracket } from '@/lib/ai/types';

interface GXScoreHeaderProps {
  compositeScore: number;
  gradeBracket: GXGradeBracket;
  dailyChange: number;
}

export function GXScoreHeader({ compositeScore, gradeBracket, dailyChange }: GXScoreHeaderProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6 md:p-8 text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Score Circle */}
        <div className="relative flex-shrink-0">
          <div className="h-28 w-28 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-4 border-cyan-400/30 flex items-center justify-center">
            <div className="text-center">
              <span className="text-3xl font-bold text-cyan-400">{compositeScore.toFixed(1)}</span>
              <span className="block text-xs text-cyan-300/70">/100</span>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1">
            <GXScoreChangeIndicator delta={dailyChange} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Your GX Score</h1>
            <GXScoreGradeBadge grade={gradeBracket} />
          </div>
          <p className="text-slate-300 text-sm md:text-base max-w-lg">
            Your Global Employability Score measures career readiness across 12 dimensions. Focus on your weakest areas to accelerate growth.
          </p>
          <p className="text-xs text-slate-400 italic">
            This is a readiness framework, not a ranking. Scores reflect your development journey.
          </p>
        </div>
      </div>
    </div>
  );
}
