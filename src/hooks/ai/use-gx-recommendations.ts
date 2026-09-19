'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GXScoreRecommendation } from '@/lib/ai/types';

export function useGXRecommendations() {
  const queryClient = useQueryClient();

  const query = useQuery<GXScoreRecommendation[]>({
    queryKey: ['gx-recommendations'],
    queryFn: async () => {
      const res = await fetch('/api/v1/gx-score/recommendations');
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Unknown error');
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/gx-score/recommendations/${id}/complete`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to complete recommendation');
      return res.json();
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['gx-recommendations'] });
      const previous = queryClient.getQueryData<GXScoreRecommendation[]>(['gx-recommendations']);
      queryClient.setQueryData<GXScoreRecommendation[]>(['gx-recommendations'], (old) =>
        (old || []).filter(r => r.id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(['gx-recommendations'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['gx-recommendations'] });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await fetch(`/api/v1/gx-score/recommendations/${id}/dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error('Failed to dismiss recommendation');
      return res.json();
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['gx-recommendations'] });
      const previous = queryClient.getQueryData<GXScoreRecommendation[]>(['gx-recommendations']);
      queryClient.setQueryData<GXScoreRecommendation[]>(['gx-recommendations'], (old) =>
        (old || []).filter(r => r.id !== id)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['gx-recommendations'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['gx-recommendations'] });
    },
  });

  return {
    recommendations: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    completeRecommendation: (id: string) => completeMutation.mutate(id),
    dismissRecommendation: (id: string, reason?: string) => dismissMutation.mutate({ id, reason }),
  };
}
