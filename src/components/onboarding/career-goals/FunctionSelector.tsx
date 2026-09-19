'use client';

import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { JOB_FUNCTIONS } from '@/lib/onboarding/constants';

interface FunctionSelectorProps {
  selected: string[];
  onChange: (functions: string[]) => void;
  max?: number;
}

export function FunctionSelector({ selected, onChange, max = 5 }: FunctionSelectorProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = query
    ? JOB_FUNCTIONS.filter((f) => f.toLowerCase().includes(query.toLowerCase()) && !selected.includes(f))
    : JOB_FUNCTIONS.filter((f) => !selected.includes(f));

  const addFunction = (fn: string) => {
    if (selected.length >= max) return;
    onChange([...selected, fn]);
    setQuery('');
    setShowDropdown(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 mb-2">
        {selected.map((fn) => (
          <span key={fn} className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full">
            {fn}
            <button type="button" onClick={() => onChange(selected.filter((s) => s !== fn))}>
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
            placeholder={`Search job functions (${selected.length}/${max})`}
          />
          {showDropdown && filtered.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filtered.slice(0, 15).map((fn) => (
                <button
                  key={fn}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addFunction(fn)}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors"
                >
                  {fn}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
