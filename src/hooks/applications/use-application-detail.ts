'use client';

import { useQuery } from '@tanstack/react-query';
import type { ApplicationDetail, ApiResponse } from '@/lib/applications/types';

export function useApplicationDetail(id: string, initialData?: ApplicationDetail) {
  return useQuery<ApplicationDetail>({
    queryKey: ['application', id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/applications/${id}`);
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message || 'Failed to fetch application');
      }
      const json: ApiResponse<ApplicationDetail> = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to fetch application');
      return json.data!;
    },
    initialData,
    staleTime: 30000,
  });
}
