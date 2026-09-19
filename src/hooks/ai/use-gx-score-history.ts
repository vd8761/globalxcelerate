'use client';

import { useQuery } from '@tanstack/react-query';

interface HistoryEntry {
  id: string;
  composite_score: number;
  dimension_scores: Record<string, number>;
  grade_bracket: string;
  change_delta: number;
  trigger_type: string;
  capped: boolean;
  created_at: string;
}

export function useGXScoreHistory(period: string = '30d') {
  const query = useQuery<HistoryEntry[]>({
    queryKey: ['gx-score-history', period],
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      const res = await fetch(`/api/v1/gx-score/history?${params}`);
      if (!res.ok) throw new Error('Failed to fetch history');
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Unknown error');
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    history: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
