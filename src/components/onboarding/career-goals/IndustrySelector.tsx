'use client';

import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { INDUSTRIES } from '@/lib/onboarding/constants';
import { cn } from '@/lib/utils';

interface IndustrySelectorProps {
  selected: string[];
  onChange: (industries: string[]) => void;
  max?: number;
}

export function IndustrySelector({ selected, onChange, max = 5 }: IndustrySelectorProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = query
    ? INDUSTRIES.filter((i) => i.toLowerCase().includes(query.toLowerCase()) && !selected.includes(i))
    : INDUSTRIES.filter((i) => !selected.includes(i));

  const addIndustry = (industry: string) => {
    if (selected.length >= max) return;
    onChange([...selected, industry]);
    setQuery('');
    setShowDropdown(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 mb-2">
        {selected.map((ind) => (
          <span key={ind} className="inline-flex items-center gap-1 bg-cyan-50 text-cyan-700 text-xs font-medium px-2.5 py-1 rounded-full">
            {ind}
            <button type="button" onClick={() => onChange(selected.filter((s) => s !== ind))}>
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      {selected.length < max && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
            placeholder={`Search industries (${selected.length}/${max})`}
          />
          {showDropdown && filtered.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filtered.slice(0, 15).map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addIndustry(ind)}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors"
                >
                  {ind}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {selected.length >= max && (
        <p className="text-xs text-slate-400">Maximum {max} industries reached</p>
      )}
    </div>
  );
}
