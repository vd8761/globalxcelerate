'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateApplicationInput } from '@/lib/validation/application-schemas';
import type { Application, ApiResponse } from '@/lib/applications/types';

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation<Application, Error, CreateApplicationInput>({
    mutationFn: async (input) => {
      const res = await fetch('/api/v1/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message || 'Failed to create application');
      }
      const json: ApiResponse<Application> = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to create application');
      return json.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}
