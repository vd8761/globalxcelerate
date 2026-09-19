'use client';

import { useState, useCallback } from 'react';
import { validateFileType, validateFileSize } from '@/validators/marketplace/upload.schema';

interface UploadedFile {
  storage_path: string;
  public_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}

export function useFileUpload(opportunityId: string) {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const upload = useCallback(async (file: File, documentType: string) => {
    setError(null);
    setProgress(0);
    setUploadedFile(null);

    // Client-side validation
    if (!validateFileType(file.type)) {
      setError('Invalid file type. Please upload PDF, DOC, DOCX, PNG, or JPG files.');
      return null;
    }
    if (!validateFileSize(file.size)) {
      setError('File is too large. Maximum size is 10MB.');
      return null;
    }

    setIsUploading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);

      setProgress(30);

      const res = await fetch(`/api/v1/opportunities/${opportunityId}/upload`, {
        method: 'POST',
        body: formData,
      });

      setProgress(90);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || 'Upload failed');
      }

      const data = await res.json();
      setProgress(100);
      setUploadedFile(data.data);
      return data.data as UploadedFile;
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [opportunityId]);

  const reset = useCallback(() => {
    setProgress(0);
    setError(null);
    setUploadedFile(null);
    setIsUploading(false);
  }, []);

  return { upload, progress, isUploading, error, uploadedFile, reset };
}
