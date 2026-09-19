'use client';

import { useState, useMemo } from 'react';
import { X, Plus } from 'lucide-react';
import { useOpportunityFilters } from '@/hooks/marketplace/use-opportunity-filters';
import { useFilterOptions } from '@/hooks/marketplace/use-filter-options';
import { MAX_INDUSTRIES_FILTER } from '@/lib/marketplace/constants';

export function FilterIndustry() {
  const { filters, setFilter } = useOpportunityFilters();
  const { data: options } = useFilterOptions();
  const [query, setQuery] = useState('');
  const selected = filters.industry || [];

  const suggestions = useMemo(() => {
    if (!query || !options?.industries) return [];
    return options.industries
      .filter((i) =>
        i.toLowerCase().includes(query.toLowerCase()) &&
        !selected.includes(i)
      )
      .slice(0, 5);
  }, [query, options?.industries, selected]);

  const add = (name: string) => {
    if (selected.length >= MAX_INDUSTRIES_FILTER) return;
    setFilter('industry', [...selected, name]);
    setQuery('');
  };

  const remove = (name: string) => {
    setFilter('industry', selected.filter((i) => i !== name));
  };

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((ind) => (
            <span key={ind} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
              {ind}
              <button onClick={() => remove(ind)} className="hover:text-indigo-900"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}

      {selected.length < MAX_INDUSTRIES_FILTER && (
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search industries..."
            className="w-full h-8 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-sm z-10 max-h-32 overflow-y-auto">
              {suggestions.map((ind) => (
                <button key={ind} onClick={() => add(ind)} className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                  <Plus className="w-3 h-3 text-slate-400" />{ind}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
