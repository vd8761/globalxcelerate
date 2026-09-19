'use client';

import { useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

async function searchSkills(query: string, category: string | null) {
  const params = new URLSearchParams({ q: query, limit: '20' });
  if (category) params.set('category', category);
  const res = await fetch(`/api/v1/reference/skills?${params}`);
  if (!res.ok) return { skills: [] };
  const json = await res.json();
  return json.data ?? { skills: [] };
}

export function useSkillSearch() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const handleSetQuery = useCallback((val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(val);
    }, 200);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['reference', 'skills', debouncedQuery, category],
    queryFn: () => searchSkills(debouncedQuery, category),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    query,
    setQuery: handleSetQuery,
    category,
    setCategory,
    results: data?.skills ?? [],
    isSearching: isLoading && debouncedQuery.length >= 2,
    clearSearch,
  };
}
