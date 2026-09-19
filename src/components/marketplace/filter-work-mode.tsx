'use client';

import { useOpportunityFilters } from '@/hooks/marketplace/use-opportunity-filters';
import { WORK_MODE_OPTIONS } from '@/lib/marketplace/constants';

export function FilterWorkMode() {
  const { filters, setFilter } = useOpportunityFilters();

  return (
    <div className="space-y-2">
      {WORK_MODE_OPTIONS.map((option) => (
        <label key={option.value} className="flex items-center gap-3 py-1 cursor-pointer">
          <input
            type="radio"
            name="workMode"
            value={option.value}
            checked={(filters.workMode || '') === option.value}
            onChange={() => setFilter('workMode', option.value)}
            className="w-4 h-4 border-slate-300 text-cyan-600 focus:ring-cyan-500"
          />
          <span className="text-sm text-slate-700">{option.label}</span>
        </label>
      ))}
    </div>
  );
}
