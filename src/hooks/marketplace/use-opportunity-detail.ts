'use client';

import { useQuery } from '@tanstack/react-query';
import type { OpportunityDetail } from '@/types/marketplace';

interface DetailResponse {
  success: boolean;
  data: OpportunityDetail;
  error?: { code: string; message: string };
}

export function useOpportunityDetail(id: string) {
  return useQuery<DetailResponse>({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/opportunities/${id}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || 'Opportunity not found');
      }
      return res.json();
    },
    staleTime: 60 * 1000,
    enabled: !!id,
  });
}
