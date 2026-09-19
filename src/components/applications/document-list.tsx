'use client';

import { useState } from 'react';
import { FileText, Download, Trash2, File, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApplicationDocument } from '@/lib/applications/types';
import { formatFileSize, formatRelativeDate } from '@/lib/applications/utils';

interface Props {
  documents: ApplicationDocument[];
  canDelete?: boolean;
  onDelete?: (docId: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  resume: 'Resume',
  transcript: 'Transcript',
  certificate: 'Certificate',
  portfolio: 'Portfolio',
  other: 'Other',
};

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.includes('pdf')) return FileText;
  return File;
}

export function DocumentList({ documents, canDelete, onDelete }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (documents.length === 0) {
    return (
      <div className="py-6 text-center rounded-lg bg-slate-50 border border-dashed border-slate-200">
        <FileText className="w-6 h-6 text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-400">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => {
        const Icon = getFileIcon(doc.mime_type);
        const isDeleting = deletingId === doc.id;
        return (
          <div
            key={doc.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 truncate font-medium">{doc.file_name}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                  {TYPE_LABELS[doc.document_type] ?? doc.document_type}
                </span>
                <span>{formatFileSize(doc.file_size)}</span>
                <span>{formatRelativeDate(doc.created_at)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {doc.download_url && (
                <a
                  href={doc.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                  aria-label="Download"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                </a>
              )}
              {canDelete && onDelete && (
                <button
                  onClick={() => {
                    if (isDeleting) {
                      onDelete(doc.id);
                      setDeletingId(null);
                    } else {
                      setDeletingId(doc.id);
                    }
                  }}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    isDeleting
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'hover:bg-slate-200 text-slate-400 hover:text-red-500'
                  )}
                  aria-label={isDeleting ? 'Confirm delete' : 'Delete'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
