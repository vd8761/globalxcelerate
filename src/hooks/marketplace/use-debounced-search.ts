'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_CHARS } from '@/lib/marketplace/constants';

export function useDebouncedSearch(initialQuery: string = '') {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.length > 0 && query.length < SEARCH_MIN_CHARS) {
      setIsDebouncing(false);
      setDebouncedQuery('');
      return;
    }

    setIsDebouncing(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setIsDebouncing(false);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  const getAbortSignal = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    return abortRef.current.signal;
  }, []);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { query, setQuery, debouncedQuery, isDebouncing, getAbortSignal };
}
