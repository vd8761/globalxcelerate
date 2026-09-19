'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useOpportunityFilters } from '@/hooks/marketplace/use-opportunity-filters';
import { useFilterOptions } from '@/hooks/marketplace/use-filter-options';

export function FilterLocation() {
  const { filters, setFilter } = useOpportunityFilters();
  const { data: options } = useFilterOptions();
  const [countrySearch, setCountrySearch] = useState('');

  const filteredCountries = useMemo(() => {
    const countries = options?.countries || [];
    if (!countrySearch) return countries.slice(0, 20);
    return countries.filter((c) =>
      c.toLowerCase().includes(countrySearch.toLowerCase())
    ).slice(0, 20);
  }, [options?.countries, countrySearch]);

  return (
    <div className="space-y-3">
      {/* Country selector */}
      <div>
        <label className="text-xs font-medium text-slate-500 mb-1 block">Country</label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={filters.country || countrySearch}
            onChange={(e) => {
              setCountrySearch(e.target.value);
              if (!e.target.value) setFilter('country', '');
            }}
            placeholder="Search country..."
            className="w-full h-9 pl-8 pr-8 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
          />
          {(filters.country || countrySearch) && (
            <button
              onClick={() => { setCountrySearch(''); setFilter('country', ''); setFilter('city', ''); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-slate-100"
            >
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
        {countrySearch && !filters.country && filteredCountries.length > 0 && (
          <div className="mt-1 max-h-32 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-sm">
            {filteredCountries.map((country) => (
              <button
                key={country}
                onClick={() => { setFilter('country', country); setCountrySearch(''); }}
                className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {country}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* City (only when country selected) */}
      {filters.country && (
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">City</label>
          <input
            type="text"
            value={filters.city || ''}
            onChange={(e) => setFilter('city', e.target.value)}
            placeholder="Enter city..."
            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
          />
        </div>
      )}
    </div>
  );
}
