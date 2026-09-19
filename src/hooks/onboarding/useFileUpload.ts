'use client';

import { useState, useCallback, useRef } from 'react';

interface UseFileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
}

export function useOnboardingFileUpload(endpoint: string, options: UseFileUploadOptions = {}) {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options;
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const upload = useCallback(async (file: File, metadata?: Record<string, string>) => {
    // Validate
    if (!allowedTypes.includes(file.type)) {
      setError(`File type ${file.type} is not allowed`);
      return null;
    }
    if (file.size > maxSize) {
      setError(`File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`);
      return null;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);
    abortRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (metadata) {
        Object.entries(metadata).forEach(([key, val]) => {
          formData.append(key, val);
        });
      }

      const res = await fetch(`/api/v1/students/onboarding/${endpoint}`, {
        method: 'POST',
        body: formData,
        signal: abortRef.current.signal,
      });

      setProgress(100);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: { message: 'Upload failed' } }));
        throw new Error(err.error?.message ?? 'Upload failed');
      }

      const result = await res.json();
      return result.data;
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
      }
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [endpoint, maxSize, allowedTypes]);

  const reset = useCallback(() => {
    setProgress(0);
    setError(null);
    setIsUploading(false);
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsUploading(false);
    setProgress(0);
  }, []);

  return { upload, progress, isUploading, error, reset, cancel };
}
