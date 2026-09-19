'use client';

import { useQuery } from '@tanstack/react-query';

interface ExplanationResult {
  explanation: string;
  improvement_suggestions: string[];
  from_cache: boolean;
}

export function useMatchExplanation(opportunityId: string, enabled: boolean = false) {
  const query = useQuery<ExplanationResult>({
    queryKey: ['match-explanation', opportunityId],
    queryFn: async () => {
      const params = new URLSearchParams({ opportunity_id: opportunityId });
      const res = await fetch(`/api/v1/matching/explain?${params}`);

      if (!res.ok) {
        throw new Error('Failed to fetch explanation');
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Unknown error');
      return json.data;
    },
    enabled: !!opportunityId && enabled,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return {
    explanation: query.data?.explanation ?? null,
    suggestions: query.data?.improvement_suggestions ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
