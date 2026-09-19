'use client';

import { useState } from 'react';
import { useOpportunityFilters } from '@/hooks/marketplace/use-opportunity-filters';

export function FilterDuration() {
  const { filters, setFilter, setMultipleFilters } = useOpportunityFilters();
  const [min, setMin] = useState(filters.durationMin || 1);
  const [max, setMax] = useState(filters.durationMax || 24);
  const unit = filters.durationUnit || 'months';

  const handleApply = () => {
    setMultipleFilters({ durationMin: min, durationMax: max, durationUnit: unit });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="text-xs text-slate-500">Min</label>
          <input
            type="number"
            min={1}
            max={max}
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            className="w-full h-8 px-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        <span className="text-slate-400 mt-4">-</span>
        <div className="flex-1">
          <label className="text-xs text-slate-500">Max</label>
          <input
            type="number"
            min={min}
            max={104}
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            className="w-full h-8 px-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        {(['weeks', 'months'] as const).map((u) => (
          <button
            key={u}
            onClick={() => setFilter('durationUnit', u)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              unit === u
                ? 'bg-cyan-100 text-cyan-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {u.charAt(0).toUpperCase() + u.slice(1)}
          </button>
        ))}
      </div>
      <button
        onClick={handleApply}
        className="w-full py-1.5 text-xs font-medium text-cyan-700 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors"
      >
        Apply Duration
      </button>
    </div>
  );
}
