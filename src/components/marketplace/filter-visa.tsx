'use client';

import { useOpportunityFilters } from '@/hooks/marketplace/use-opportunity-filters';

export function FilterVisa() {
  const { filters, setFilter } = useOpportunityFilters();

  return (
    <label className="flex items-center justify-between py-1 cursor-pointer">
      <span className="text-sm text-slate-700">Visa sponsorship available</span>
      <button
        role="switch"
        aria-checked={!!filters.visaSupport}
        onClick={() => setFilter('visaSupport', !filters.visaSupport)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
          filters.visaSupport ? 'bg-cyan-500' : 'bg-slate-200'
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
          filters.visaSupport ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </label>
  );
}
