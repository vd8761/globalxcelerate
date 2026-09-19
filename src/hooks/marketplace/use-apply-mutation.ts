'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApplicationSubmission, ApplicationResponse } from '@/types/marketplace';

interface ApplyResponse {
  success: boolean;
  data: ApplicationResponse;
  error?: { code: string; message: string };
}

export function useApplyMutation(opportunityId: string) {
  const queryClient = useQueryClient();

  return useMutation<ApplyResponse, Error, ApplicationSubmission>({
    mutationFn: async (submission) => {
      const res = await fetch(`/api/v1/opportunities/${opportunityId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'Application failed');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunity', opportunityId] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}
