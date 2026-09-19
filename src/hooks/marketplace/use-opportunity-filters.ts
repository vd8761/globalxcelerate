'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { MarketplaceFilters } from '@/types/marketplace';
import { serializeFilters, deserializeFilters, getActiveFilterCount, getActiveFilterLabels, removeFilter } from '@/lib/marketplace/filter-utils';

export function useOpportunityFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(() => deserializeFilters(searchParams), [searchParams]);

  const activeCount = useMemo(() => getActiveFilterCount(filters), [filters]);

  const activeLabels = useMemo(() => getActiveFilterLabels(filters), [filters]);

  const setFilter = useCallback(
    (key: string, value: unknown) => {
      const updated = { ...filters, [key]: value, page: 1 };
      const params = serializeFilters(updated as Partial<MarketplaceFilters>);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [filters, router, pathname]
  );

  const setMultipleFilters = useCallback(
    (updates: Partial<MarketplaceFilters>) => {
      const updated = { ...filters, ...updates, page: 1 };
      const params = serializeFilters(updated as Partial<MarketplaceFilters>);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [filters, router, pathname]
  );

  const removeFilterValue = useCallback(
    (key: string, value?: string) => {
      const updated = removeFilter(filters, key, value);
      const params = serializeFilters(updated);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [filters, router, pathname]
  );

  const clearAll = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const setPage = useCallback(
    (page: number) => {
      const updated = { ...filters, page };
      const params = serializeFilters(updated as Partial<MarketplaceFilters>);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [filters, router, pathname]
  );

  return {
    filters,
    setFilter,
    setMultipleFilters,
    removeFilter: removeFilterValue,
    clearAll,
    setPage,
    activeCount,
    activeLabels,
  };
}
