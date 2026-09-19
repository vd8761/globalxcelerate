'use client';

import { FileText, File, Check } from 'lucide-react';
import type { ApplicationDocument } from '@/types/marketplace';

interface ApplyReviewProps {
  coverLetter: string;
  documents: ApplicationDocument[];
  confirmed: boolean;
  onConfirmChange: (confirmed: boolean) => void;
}

export function ApplyReview({ coverLetter, documents, confirmed, onConfirmChange }: ApplyReviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Review Your Application</h3>
        <p className="text-xs text-slate-500">Please review all details before submitting.</p>
      </div>

      {/* Cover Letter */}
      <div className="bg-slate-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <h4 className="text-xs font-medium text-slate-700">Cover Letter</h4>
        </div>
        {coverLetter ? (
          <p className="text-sm text-slate-600 line-clamp-5">{coverLetter}</p>
        ) : (
          <p className="text-sm text-slate-400 italic">No cover letter provided</p>
        )}
      </div>

      {/* Documents */}
      <div className="bg-slate-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <File className="w-4 h-4 text-slate-400" />
          <h4 className="text-xs font-medium text-slate-700">Documents ({documents.length})</h4>
        </div>
        {documents.length > 0 ? (
          <ul className="space-y-1.5">
            {documents.map((doc, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" />
                {doc.name} <span className="text-xs text-slate-400">({doc.type.replace('_', ' ')})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 italic">No documents uploaded</p>
        )}
      </div>

      {/* Confirmation */}
      <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => onConfirmChange(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 mt-0.5"
        />
        <span className="text-sm text-slate-700">
          I confirm that all information provided is accurate and complete to the best of my knowledge.
        </span>
      </label>
    </div>
  );
}
