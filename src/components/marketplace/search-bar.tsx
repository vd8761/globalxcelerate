'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebouncedSearch } from '@/hooks/marketplace/use-debounced-search';
import { useOpportunityFilters } from '@/hooks/marketplace/use-opportunity-filters';
import { SEARCH_MIN_CHARS } from '@/lib/marketplace/constants';
import { saveRecentSearch } from '@/lib/marketplace/search-utils';
import { SearchSuggestions } from './search-suggestions';

export function SearchBar() {
  const { filters, setFilter } = useOpportunityFilters();
  const { query, setQuery, debouncedQuery, isDebouncing } = useDebouncedSearch(filters.q || '');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevDebounced = useRef(debouncedQuery);

  useEffect(() => {
    if (debouncedQuery !== prevDebounced.current) {
      prevDebounced.current = debouncedQuery;
      setFilter('q', debouncedQuery);
      if (debouncedQuery.length >= SEARCH_MIN_CHARS) {
        saveRecentSearch(debouncedQuery);
      }
    }
  }, [debouncedQuery, setFilter]);

  const handleClear = useCallback(() => {
    setQuery('');
    setFilter('q', '');
    inputRef.current?.focus();
  }, [setQuery, setFilter]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setFilter('q', suggestion);
    setIsFocused(false);
  }, [setQuery, setFilter]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {isDebouncing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search opportunities by title, company, skills..."
          className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 pl-12 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
          aria-label="Search opportunities"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {isFocused && !query && (
        <SearchSuggestions onSelect={handleSuggestionClick} />
      )}
      {query.length > 0 && query.length < SEARCH_MIN_CHARS && (
        <p className="absolute mt-1 text-xs text-slate-400 pl-4">Type at least {SEARCH_MIN_CHARS} characters to search</p>
      )}
    </div>
  );
}
