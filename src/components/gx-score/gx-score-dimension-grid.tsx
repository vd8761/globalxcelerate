'use client';

import { GXScoreDimensionCard } from './gx-score-dimension-card';
import { DIMENSION_DEFINITIONS } from '@/lib/ai/constants/gx-dimensions';

interface GXScoreDimensionGridProps {
  dimensions: Record<string, number>;
}

export function GXScoreDimensionGrid({ dimensions }: GXScoreDimensionGridProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">All Dimensions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {DIMENSION_DEFINITIONS.map(dim => (
          <GXScoreDimensionCard
            key={dim.id}
            dimension={dim}
            score={dimensions[dim.id] || 0}
          />
        ))}
      </div>
    </div>
  );
}
