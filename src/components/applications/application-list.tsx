'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useApplications } from '@/hooks/applications/use-applications';
import { useApplicationFiltersStore } from '@/stores/applications/application-filters-store';
import { ApplicationCard } from './application-card';
import { ApplicationFilters } from './application-filters';
import { ApplicationEmptyState } from './application-empty-state';

export function ApplicationList() {
  const { activeTab, searchQuery, resetFilters } = useApplicationFiltersStore();
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useApplications();

  const observerRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  const applications = data?.pages.flatMap((p) => p.data ?? []) ?? [];
  const totalCount = data?.pages[0]?.meta?.total ?? 0;
  const isFiltered = activeTab !== 'all' || searchQuery.length > 0;

  // Compute tab counts from first page meta (approximate)
  const tabCounts: Record<string, number> = { all: totalCount };

  if (isError) {
    return (
      <div className="space-y-6">
        <ApplicationFilters tabCounts={tabCounts} />
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-red-600 mb-3">{(error as Error)?.message || 'Failed to load applications'}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ApplicationFilters tabCounts={tabCounts} />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[140px] rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <ApplicationEmptyState filterActive={isFiltered} onResetFilter={isFiltered ? resetFilters : undefined} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={observerRef} className="h-4" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 text-cyan-600 animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
