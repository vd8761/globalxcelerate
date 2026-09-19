'use client';

import { useOpportunityFilters } from '@/hooks/marketplace/use-opportunity-filters';
import type { CompensationType } from '@/types/marketplace';

const TYPES: { value: CompensationType; label: string }[] = [
  { value: 'paid', label: 'Paid' },
  { value: 'stipend', label: 'Stipend' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'scholarship', label: 'Scholarship' },
];

export function FilterCompensation() {
  const { filters, setFilter } = useOpportunityFilters();
  const selected = filters.compensationType || [];

  const toggle = (type: CompensationType) => {
    const current = [...selected];
    const idx = current.indexOf(type);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(type);
    setFilter('compensationType', current);
  };

  const showRange = selected.includes('paid') || selected.includes('stipend');

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {TYPES.map((t) => (
          <label key={t.value} className="flex items-center gap-3 py-1 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(t.value)}
              onChange={() => toggle(t.value)}
              className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
            />
            <span className="text-sm text-slate-700">{t.label}</span>
          </label>
        ))}
      </div>

      {showRange && (
        <div className="pt-2 border-t border-slate-100">
          <label className="text-xs text-slate-500 mb-1 block">Monthly range (USD)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={10000}
              value={filters.compensationMin || 0}
              onChange={(e) => setFilter('compensationMin', Number(e.target.value))}
              placeholder="Min"
              className="w-full h-8 px-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              min={0}
              max={10000}
              value={filters.compensationMax || 10000}
              onChange={(e) => setFilter('compensationMax', Number(e.target.value))}
              placeholder="Max"
              className="w-full h-8 px-2 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
