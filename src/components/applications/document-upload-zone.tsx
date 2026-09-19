'use client';

import { useCallback, useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from '@/lib/applications/constants';
import { useUploadDocument } from '@/hooks/applications/use-application-documents';
import { formatFileSize } from '@/lib/applications/utils';
import type { DocumentType } from '@/lib/applications/types';

interface Props {
  applicationId: string;
  currentDocumentCount: number;
  maxDocuments?: number;
  onUploadComplete: (doc: unknown) => void;
  disabled?: boolean;
}

export function DocumentUploadZone({
  applicationId,
  currentDocumentCount,
  maxDocuments = 5,
  onUploadComplete,
  disabled = false,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [docType, setDocType] = useState<DocumentType>('resume');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadDocument(applicationId);
  const isAtMax = currentDocumentCount >= maxDocuments;
  const isDisabled = disabled || isAtMax;

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
      return `${file.name}: Unsupported file type. Use PDF, DOC, DOCX, JPG, or PNG.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File exceeds 10MB limit.`;
    }
    return null;
  };

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      setErrors([]);
      const fileArray = Array.from(files);
      const remaining = maxDocuments - currentDocumentCount;

      if (fileArray.length > remaining) {
        setErrors([`Only ${remaining} more document${remaining === 1 ? '' : 's'} can be uploaded.`]);
        return;
      }

      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          setErrors((prev) => [...prev, error]);
          continue;
        }

        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        try {
          // Simulate upload progress
          const interval = setInterval(() => {
            setUploadProgress((prev) => {
              const current = prev[file.name] ?? 0;
              if (current >= 90) {
                clearInterval(interval);
                return prev;
              }
              return { ...prev, [file.name]: current + 10 };
            });
          }, 100);

          const result = await uploadMutation.mutateAsync({
            file_name: file.name,
            document_type: docType,
            file_size: file.size,
            mime_type: file.type as (typeof ALLOWED_MIME_TYPES)[number],
          });

          clearInterval(interval);
          setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));

          // If we got an upload URL, upload the file to storage
          if (result.upload_url) {
            await fetch(result.upload_url, {
              method: 'PUT',
              headers: { 'Content-Type': file.type },
              body: file,
            });
          }

          onUploadComplete(result);

          // Clean up progress after a moment
          setTimeout(() => {
            setUploadProgress((prev) => {
              const copy = { ...prev };
              delete copy[file.name];
              return copy;
            });
          }, 1000);
        } catch (err) {
          setUploadProgress((prev) => {
            const copy = { ...prev };
            delete copy[file.name];
            return copy;
          });
          setErrors((prev) => [...prev, `${file.name}: ${(err as Error).message}`]);
        }
      }
    },
    [currentDocumentCount, docType, maxDocuments, onUploadComplete, uploadMutation]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (isDisabled) return;
      processFiles(e.dataTransfer.files);
    },
    [isDisabled, processFiles]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value as DocumentType)}
          disabled={isDisabled}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-cyan-400 outline-none"
        >
          <option value="resume">Resume</option>
          <option value="transcript">Transcript</option>
          <option value="certificate">Certificate</option>
          <option value="portfolio">Portfolio</option>
          <option value="other">Other</option>
        </select>
        <span className="text-xs text-slate-400">{currentDocumentCount} of {maxDocuments} uploaded</span>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); if (!isDisabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isDisabled && fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer',
          isDragging && !isDisabled ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 hover:border-cyan-300 hover:bg-slate-50',
          isDisabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
        <p className="text-xs text-slate-500">
          {isAtMax
            ? 'Maximum documents reached'
            : 'Drop files here or click to browse'
          }
        </p>
        <p className="text-[11px] text-slate-400 mt-1">PDF, DOC, DOCX, JPG, PNG • Max 10MB</p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          multiple
          disabled={isDisabled}
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />
      </div>

      {/* Upload progress */}
      {Object.entries(uploadProgress).map(([name, progress]) => (
        <div key={name} className="flex items-center gap-2 text-xs">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate flex-1 text-slate-600">{name}</span>
          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ))}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-red-600">
              <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
