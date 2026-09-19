'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { DocumentUploadInput } from '@/lib/validation/application-schemas';
import type { ApplicationDocument, ApiResponse } from '@/lib/applications/types';

export function useUploadDocument(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation<ApplicationDocument & { upload_url?: string }, Error, DocumentUploadInput>({
    mutationFn: async (input) => {
      const res = await fetch(`/api/v1/applications/${applicationId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message || 'Failed to upload document');
      }
      const json: ApiResponse<ApplicationDocument & { upload_url?: string }> = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to upload document');
      return json.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
    },
  });
}

export function useDeleteDocument(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (documentId) => {
      const res = await fetch(`/api/v1/applications/${applicationId}/documents/${documentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message || 'Failed to delete document');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
    },
  });
}

export function useDocumentDownload(applicationId: string, documentId: string) {
  return useQuery<string>({
    queryKey: ['document-download', applicationId, documentId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/applications/${applicationId}/documents/${documentId}/download`);
      if (!res.ok) throw new Error('Failed to get download URL');
      const json: ApiResponse<{ url: string }> = await res.json();
      return json.data?.url ?? '';
    },
    enabled: false, // Only fetch on demand
  });
}
