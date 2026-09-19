'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import type { OpportunityListItem, CategoryCounts } from '@/types/marketplace';

interface OpportunitiesResponse {
  success: boolean;
  data: {
    opportunities: OpportunityListItem[];
    category_counts: CategoryCounts;
    pagination: {
      page: number;
      per_page: number;
      total_items: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
  error?: { code: string; message: string };
}

export function useOpportunitiesQuery() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  return useQuery<OpportunitiesResponse>({
    queryKey: ['opportunities', queryString],
    queryFn: async () => {
      const res = await fetch(`/api/v1/opportunities?${queryString}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || 'Failed to fetch opportunities');
      }
      return res.json();
    },
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}
