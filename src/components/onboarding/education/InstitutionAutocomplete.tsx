'use client';

import { useState, useRef, useEffect } from 'react';
import { useInstitutionSearch } from '@/hooks/onboarding/useInstitutionSearch';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InstitutionAutocompleteProps {
  value: string;
  onSelect: (name: string, id?: string) => void;
}

export function InstitutionAutocomplete({ value, onSelect }: InstitutionAutocompleteProps) {
  const [localValue, setLocalValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setQuery, results, isSearching } = useInstitutionSearch();

  useEffect(() => { setLocalValue(value); }, [value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleChange = (val: string) => {
    setLocalValue(val);
    setQuery(val);
    setShowDropdown(val.length >= 2);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => localValue.length >= 2 && setShowDropdown(true)}
          onBlur={() => {
            // Allow click on dropdown items
            setTimeout(() => {
              if (localValue !== value) onSelect(localValue);
            }, 150);
          }}
          className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
          placeholder="Search or type institution name"
        />
        {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />}
      </div>

      {showDropdown && (results.length > 0 || localValue.length >= 2) && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {results.map((inst: { id: string; name: string; country?: string }) => (
            <button
              key={inst.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setLocalValue(inst.name);
                onSelect(inst.name, inst.id);
                setShowDropdown(false);
              }}
              className="w-full px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors"
            >
              {inst.name}
              {inst.country && <span className="text-xs text-slate-400 ml-2">{inst.country}</span>}
            </button>
          ))}
          {results.length === 0 && localValue.length >= 2 && !isSearching && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(localValue);
                setShowDropdown(false);
              }}
              className="w-full px-3 py-2 text-sm text-left text-cyan-600 hover:bg-cyan-50 transition-colors"
            >
              Use custom: "{localValue}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
