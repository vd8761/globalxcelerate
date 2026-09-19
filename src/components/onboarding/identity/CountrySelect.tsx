'use client';

import { useState, useRef, useEffect } from 'react';
import countriesData from '@/data/countries.json';
import { cn } from '@/lib/utils';

interface CountrySelectProps {
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
}

export function CountrySelect({ value, onChange, placeholder = 'Select country' }: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const countries = countriesData as { code: string; name: string; flag: string }[];
  const selected = countries.find((c) => c.code === value);

  const filtered = query
    ? countries.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.code.toLowerCase().includes(query.toLowerCase())
      )
    : countries;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setTimeout(() => inputRef.current?.focus(), 50); }}
        className={cn(
          'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-left',
          'focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all',
          !selected && 'text-slate-400',
        )}
      >
        {selected ? (
          <span>{selected.flag} {selected.name}</span>
        ) : (
          <span>{placeholder}</span>
        )}
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white rounded-lg border border-slate-200 shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:border-cyan-500"
              placeholder="Search countries..."
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.slice(0, 50).map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  onChange(country.code);
                  setOpen(false);
                  setQuery('');
                }}
                className={cn(
                  'w-full px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors flex items-center gap-2',
                  country.code === value && 'bg-cyan-50 text-cyan-700',
                )}
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-sm text-slate-400 text-center">No countries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
