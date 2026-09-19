'use client';

import { X } from 'lucide-react';
import { useOpportunityFilters } from '@/hooks/marketplace/use-opportunity-filters';

export function ActiveFilterChips() {
  const { activeLabels, removeFilter, clearAll, activeCount } = useOpportunityFilters();

  if (activeCount === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
      {activeLabels.map((chip, i) => (
        <span
          key={`${chip.key}-${chip.value}-${i}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-700 whitespace-nowrap shadow-sm"
        >
          <span className="text-slate-400">{chip.label}:</span>
          {chip.value}
          <button
            onClick={() => removeFilter(chip.key, chip.value)}
            className="ml-0.5 p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={`Remove ${chip.label}: ${chip.value}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        onClick={clearAll}
        className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 whitespace-nowrap transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}
