'use client';

import { useQuery } from '@tanstack/react-query';

interface GXScoreResult {
  composite_score: number;
  grade_bracket: string;
  dimensions: Record<string, number>;
  daily_change: number;
  anti_gaming_flagged: boolean;
  last_calculated_at: string;
}

export function useGXScore() {
  const query = useQuery<GXScoreResult>({
    queryKey: ['gx-score'],
    queryFn: async () => {
      const res = await fetch('/api/v1/gx-score');
      if (!res.ok) throw new Error('Failed to fetch GX Score');
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Unknown error');
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    score: query.data?.composite_score ?? null,
    dimensions: query.data?.dimensions ?? null,
    gradeBracket: query.data?.grade_bracket ?? null,
    dailyChange: query.data?.daily_change ?? 0,
    antiGamingFlagged: query.data?.anti_gaming_flagged ?? false,
    lastCalculatedAt: query.data?.last_calculated_at ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
}
