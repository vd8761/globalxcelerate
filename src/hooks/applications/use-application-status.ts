'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { StatusTransitionInput } from '@/lib/validation/application-schemas';
import type { ApiResponse } from '@/lib/applications/types';

export function useApplicationStatus(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, StatusTransitionInput>({
    mutationFn: async (input) => {
      const res = await fetch(`/api/v1/applications/${applicationId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        if (res.status === 409) {
          throw new Error('Version conflict: please refresh and try again.');
        }
        throw new Error(err?.error?.message || 'Failed to update status');
      }
      const json: ApiResponse<unknown> = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to update status');
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}
