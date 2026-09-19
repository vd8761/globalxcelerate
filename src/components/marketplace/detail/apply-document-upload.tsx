'use client';

import { useCallback, useState } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { useFileUpload } from '@/hooks/marketplace/use-file-upload';
import type { ApplicationDocument } from '@/types/marketplace';

interface ApplyDocumentUploadProps {
  opportunityId: string;
  documents: ApplicationDocument[];
  onDocumentsChange: (docs: ApplicationDocument[]) => void;
}

const DOC_TYPES = [
  { value: 'resume', label: 'Resume/CV' },
  { value: 'transcript', label: 'Transcript' },
  { value: 'cover_letter_pdf', label: 'Cover Letter (PDF)' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'other', label: 'Other' },
] as const;

export function ApplyDocumentUpload({ opportunityId, documents, onDocumentsChange }: ApplyDocumentUploadProps) {
  const { upload, progress, isUploading, error, reset } = useFileUpload(opportunityId);
  const [docType, setDocType] = useState<string>('resume');

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await upload(file, docType);
    if (result) {
      onDocumentsChange([
        ...documents,
        {
          name: result.file_name,
          storage_path: result.storage_path,
          type: docType as any,
          size_bytes: result.file_size,
        },
      ]);
      reset();
    }
    // Reset file input
    e.target.value = '';
  }, [upload, docType, documents, onDocumentsChange, reset]);

  const removeDocument = (index: number) => {
    onDocumentsChange(documents.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-slate-700 mb-1">Upload Documents</h3>
        <p className="text-xs text-slate-500">PDF, DOC, DOCX, PNG, or JPG — Maximum 10MB each</p>
      </div>

      {/* Document type selector */}
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Document type</label>
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
        >
          {DOC_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Upload zone */}
      <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/30 transition-colors">
        <Upload className="w-6 h-6 text-slate-400 mb-2" />
        <span className="text-sm text-slate-500">Click to upload or drag and drop</span>
        <input
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
      </label>

      {/* Upload progress */}
      {isUploading && (
        <div className="space-y-1">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-slate-400">Uploading... {progress}%</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-xs text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Uploaded files list */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">Uploaded documents</p>
          {documents.map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 min-w-0">
                <File className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-700 truncate">{doc.name}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{doc.type.replace('_', ' ')} • {(doc.size_bytes / 1024).toFixed(0)}KB</p>
                </div>
              </div>
              <button
                onClick={() => removeDocument(idx)}
                className="p-1 rounded hover:bg-slate-200 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
