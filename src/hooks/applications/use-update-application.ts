'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateApplicationInput } from '@/lib/validation/application-schemas';
import type { Application, ApiResponse } from '@/lib/applications/types';

export function useUpdateApplication(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation<Application, Error, UpdateApplicationInput>({
    mutationFn: async (input) => {
      const res = await fetch(`/api/v1/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        if (res.status === 409) {
          throw new Error('Version conflict: this application was modified elsewhere. Please refresh and try again.');
        }
        throw new Error(err?.error?.message || 'Failed to update application');
      }
      const json: ApiResponse<Application> = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to update application');
      return json.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
    },
  });
}
