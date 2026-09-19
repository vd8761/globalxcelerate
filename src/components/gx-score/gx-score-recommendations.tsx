'use client';

import { GXScoreRecommendationCard } from './gx-score-recommendation-card';
import type { GXScoreRecommendation } from '@/lib/ai/types';

interface GXScoreRecommendationsProps {
  recommendations: GXScoreRecommendation[];
  onComplete: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function GXScoreRecommendations({ recommendations, onComplete, onDismiss }: GXScoreRecommendationsProps) {
  const active = recommendations
    .filter(r => !r.is_completed && !r.is_dismissed)
    .slice(0, 5);

  if (active.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-lg font-semibold text-slate-900">All caught up!</h3>
        <p className="text-sm text-slate-500 mt-1">You&apos;ve addressed all current recommendations. Keep building your profile for new suggestions.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Improvement Recommendations</h3>
      <div className="space-y-3">
        {active.map(rec => (
          <GXScoreRecommendationCard
            key={rec.id}
            recommendation={rec}
            onComplete={() => onComplete(rec.id)}
            onDismiss={() => onDismiss(rec.id)}
          />
        ))}
      </div>
    </div>
  );
}
