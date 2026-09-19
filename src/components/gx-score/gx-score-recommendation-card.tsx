'use client';

import { DIMENSION_DEFINITIONS } from '@/lib/ai/constants/gx-dimensions';
import type { GXScoreRecommendation } from '@/lib/ai/types';
import { CheckCircle2, X, ArrowUpRight } from 'lucide-react';

interface GXScoreRecommendationCardProps {
  recommendation: GXScoreRecommendation;
  onComplete: () => void;
  onDismiss: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-slate-400',
};

export function GXScoreRecommendationCard({ recommendation, onComplete, onDismiss }: GXScoreRecommendationCardProps) {
  const dimensionDef = DIMENSION_DEFINITIONS.find(d => d.id === recommendation.dimension);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`h-2 w-2 rounded-full ${PRIORITY_COLORS[recommendation.priority]}`} />
            <h4 className="text-sm font-semibold text-slate-900 truncate">{recommendation.title}</h4>
          </div>
          <p className="text-xs text-slate-500 line-clamp-2 mb-2">{recommendation.description}</p>
          <div className="flex items-center gap-3 flex-wrap">
            {dimensionDef && (
              <span className="inline-flex items-center text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
                {dimensionDef.label}
              </span>
            )}
            <span className="text-xs text-cyan-700 font-medium">+{recommendation.estimated_impact} pts impact</span>
            {recommendation.action_url && (
              <a
                href={recommendation.action_url}
                className="inline-flex items-center text-xs text-cyan-600 hover:text-cyan-700 font-medium gap-0.5"
              >
                Take action <ArrowUpRight className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onComplete}
            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="Mark complete"
          >
            <CheckCircle2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      {/* Impact bar */}
      <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-cyan-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(recommendation.estimated_impact * 5, 100)}%` }}
        />
      </div>
    </div>
  );
}
