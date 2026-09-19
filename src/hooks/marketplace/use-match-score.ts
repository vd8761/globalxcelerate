'use client';

import { useQuery } from '@tanstack/react-query';
import type { MatchAnalysis } from '@/types/marketplace';

interface MatchResponse {
  success: boolean;
  data: MatchAnalysis;
  error?: { code: string; message: string };
}

export function useMatchScore(opportunityId: string, enabled: boolean = true) {
  return useQuery<MatchResponse>({
    queryKey: ['match-score', opportunityId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/opportunities/${opportunityId}/match`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) return null as any;
        throw new Error('Failed to compute match score');
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    enabled: enabled && !!opportunityId,
    retry: false,
  });
}
