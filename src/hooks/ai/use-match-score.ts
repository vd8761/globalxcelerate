'use client';

import { useQuery } from '@tanstack/react-query';

interface MatchScoreResult {
  composite_score: number;
  dimensions: Record<string, { score: number; weight: number; weighted_score: number; label: string }>;
  skill_gaps: Array<{ skill_name: string; priority: string; proficiency_required: number; proficiency_current: number | null }>;
  from_cache: boolean;
  calculated_at: string;
}

export function useMatchScore(opportunityId: string, options?: { enabled?: boolean }) {
  const query = useQuery<MatchScoreResult>({
    queryKey: ['match-score', opportunityId],
    queryFn: async () => {
      const res = await fetch('/api/v1/matching/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: opportunityId }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch match score');
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Unknown error');
      return json.data;
    },
    enabled: !!opportunityId && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    score: query.data?.composite_score ?? null,
    dimensions: query.data?.dimensions ?? null,
    skillGaps: query.data?.skill_gaps ?? [],
    fromCache: query.data?.from_cache ?? false,
    isLoading: query.isLoading,
    error: query.error,
  };
}
