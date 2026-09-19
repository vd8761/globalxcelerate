'use client';

import { ArrowUpDown } from 'lucide-react';
import { useOpportunityFilters } from '@/hooks/marketplace/use-opportunity-filters';
import { SORT_OPTIONS } from '@/lib/marketplace/constants';

interface SortDropdownProps {
  hasSearch?: boolean;
  isAuthenticated?: boolean;
}

export function SortDropdown({ hasSearch = false, isAuthenticated = false }: SortDropdownProps) {
  const { filters, setFilter } = useOpportunityFilters();

  const visibleOptions = SORT_OPTIONS.filter((opt) => {
    if (opt.requiresSearch && !hasSearch) return false;
    if (opt.requiresAuth && !isAuthenticated) return false;
    return true;
  });

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-4 h-4 text-slate-400" />
      <select
        value={filters.sort || 'newest'}
        onChange={(e) => setFilter('sort', e.target.value)}
        className="h-9 pl-2 pr-8 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 cursor-pointer appearance-none"
        aria-label="Sort opportunities"
      >
        {visibleOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
