'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSavedOpportunitiesStore } from '@/stores/marketplace/saved-opportunities-store';
import { useCallback, useRef } from 'react';

export function useSaveOpportunity() {
  const queryClient = useQueryClient();
  const { addSaved, removeSaved } = useSavedOpportunitiesStore();
  const debounceRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const saveMutation = useMutation({
    mutationFn: async (opportunityId: string) => {
      const res = await fetch('/api/v1/opportunities/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: opportunityId }),
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: async (opportunityId: string) => {
      const res = await fetch('/api/v1/opportunities/saved', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: opportunityId }),
      });
      if (!res.ok) throw new Error('Failed to unsave');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });

  const toggleSave = useCallback((opportunityId: string, currentlySaved: boolean) => {
    // Debounce rapid toggles
    const existing = debounceRef.current.get(opportunityId);
    if (existing) clearTimeout(existing);

    // Optimistic update
    if (currentlySaved) {
      removeSaved(opportunityId);
    } else {
      addSaved(opportunityId);
    }

    const timer = setTimeout(() => {
      if (currentlySaved) {
        unsaveMutation.mutate(opportunityId, {
          onError: () => addSaved(opportunityId), // Rollback
        });
      } else {
        saveMutation.mutate(opportunityId, {
          onError: () => removeSaved(opportunityId), // Rollback
        });
      }
      debounceRef.current.delete(opportunityId);
    }, 500);

    debounceRef.current.set(opportunityId, timer);
  }, [addSaved, removeSaved, saveMutation, unsaveMutation]);

  return {
    toggleSave,
    isLoading: saveMutation.isPending || unsaveMutation.isPending,
  };
}
