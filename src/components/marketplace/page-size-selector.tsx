'use client';

import { useOpportunityFilters } from '@/hooks/marketplace/use-opportunity-filters';
import { PAGE_SIZE_OPTIONS } from '@/lib/marketplace/constants';

export function PageSizeSelector() {
  const { filters, setFilter } = useOpportunityFilters();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500">Show:</span>
      <select
        value={filters.pageSize || 20}
        onChange={(e) => setFilter('pageSize', Number(e.target.value))}
        className="h-8 pl-2 pr-6 rounded-md border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>
    </div>
  );
}
