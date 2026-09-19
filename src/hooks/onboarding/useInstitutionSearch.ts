'use client';

import { useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

async function searchInstitutions(query: string) {
  const params = new URLSearchParams({ q: query, limit: '10' });
  const res = await fetch(`/api/v1/reference/institutions?${params}`);
  if (!res.ok) return { institutions: [] };
  const json = await res.json();
  return json.data ?? { institutions: [] };
}

export function useInstitutionSearch() {
  const [query, setQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const handleSetQuery = useCallback((val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(val);
    }, 300);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['reference', 'institutions', debouncedQuery],
    queryFn: () => searchInstitutions(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
  });

  return {
    query,
    setQuery: handleSetQuery,
    results: data?.institutions ?? [],
    isSearching: isLoading && debouncedQuery.length >= 2,
  };
}
