'use client';

import { SearchX, SlidersHorizontal } from 'lucide-react';
import { useOpportunityFilters } from '@/hooks/marketplace/use-opportunity-filters';

interface EmptyStateProps {
  searchQuery?: string;
}

export function EmptyState({ searchQuery }: EmptyStateProps) {
  const { clearAll, activeCount } = useOpportunityFilters();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <SearchX className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        No opportunities found
      </h3>
      <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
        {searchQuery
          ? `No results for "${searchQuery}". Try different keywords or adjust your filters.`
          : 'No opportunities match your current filters. Try removing some filters to see more results.'}
      </p>
      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Clear all filters
        </button>
      )}
    </div>
  );
}
