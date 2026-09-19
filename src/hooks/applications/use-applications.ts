'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useApplicationFiltersStore } from '@/stores/applications/application-filters-store';
import { FILTER_TABS, ITEMS_PER_PAGE } from '@/lib/applications/constants';
import type { ApplicationListItem, ApiResponse, PaginationMeta } from '@/lib/applications/types';

interface PageResponse {
  data: ApplicationListItem[];
  meta: PaginationMeta;
}

export function useApplications() {
  const { activeTab, searchQuery, sortBy, sortOrder } = useApplicationFiltersStore();

  const tab = FILTER_TABS.find((t) => t.id === activeTab);
  const statusFilter = tab?.statuses.length ? tab.statuses.join(',') : undefined;

  return useInfiniteQuery<PageResponse>({
    queryKey: ['applications', { status: statusFilter, search: searchQuery, sortBy, sortOrder }],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);
      params.set('sort_by', sortBy);
      params.set('sort_order', sortOrder);
      params.set('page', String(pageParam));
      params.set('per_page', String(ITEMS_PER_PAGE));

      const res = await fetch(`/api/v1/applications?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message || 'Failed to fetch applications');
      }
      const json: ApiResponse<ApplicationListItem[]> = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to fetch applications');
      return { data: json.data ?? [], meta: json.meta! };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.total_pages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    staleTime: 30000,
  });
}
