'use client';

import { useMemo } from 'react';
import { useMatchScore } from './use-match-score';

export function useSkillGaps(opportunityId: string) {
  const { skillGaps, isLoading, error } = useMatchScore(opportunityId);

  const analysis = useMemo(() => {
    if (!skillGaps) return { gaps: [], matchedCount: 0, missingCount: 0, partialCount: 0 };

    const missing = skillGaps.filter(g => g.proficiency_current === null);
    const partial = skillGaps.filter(g => g.proficiency_current !== null);

    return {
      gaps: skillGaps,
      matchedCount: 0, // Matched skills not included in gaps array
      missingCount: missing.length,
      partialCount: partial.length,
    };
  }, [skillGaps]);

  return { ...analysis, isLoading, error };
}
