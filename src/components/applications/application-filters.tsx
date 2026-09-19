'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FILTER_TABS, SORT_OPTIONS, SEARCH_DEBOUNCE_MS } from '@/lib/applications/constants';
import { useApplicationFiltersStore } from '@/stores/applications/application-filters-store';

interface Props {
  tabCounts?: Record<string, number>;
}

export function ApplicationFilters({ tabCounts }: Props) {
  const { activeTab, setActiveTab, searchQuery, setSearchQuery, sortBy, sortOrder, setSortBy, setSortOrder } =
    useApplicationFiltersStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  const handleSortChange = useCallback(
    (value: string) => {
      const [field, order] = value.split(':');
      setSortBy(field);
      setSortOrder(order as 'asc' | 'desc');
    },
    [setSortBy, setSortOrder]
  );

  const currentSort = `${sortBy}:${sortOrder}`;

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {FILTER_TABS.map((tab) => {
          const count = tabCounts?.[tab.id];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              {tab.label}
              {count !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold',
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}      </div>

      {/* Search & Sort Row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by opportunity or organization..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="appearance-none pl-10 pr-8 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
