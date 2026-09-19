'use client';

import { useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';
import { getRecentSearches, clearRecentSearches } from '@/lib/marketplace/search-utils';

interface SearchSuggestionsProps {
  onSelect: (query: string) => void;
}

export function SearchSuggestions({ onSelect }: SearchSuggestionsProps) {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    setSearches(getRecentSearches());
  }, []);

  if (searches.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Recent Searches</span>
        <button
          onClick={() => {
            clearRecentSearches();
            setSearches([]);
          }}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          Clear history
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((search) => (
          <button
            key={search}
            onClick={() => onSelect(search)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
          >
            <Clock className="w-3 h-3 text-slate-400" />
            {search}
          </button>
        ))}
      </div>
    </div>
  );
}
