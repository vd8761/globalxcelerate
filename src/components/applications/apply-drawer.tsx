'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Loader2, CheckSquare, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApplyEligibilityCheck } from './apply-eligibility-check';
import { ApplyMatchScore } from './apply-match-score';
import { CoverLetterEditor } from './cover-letter-editor';
import { DocumentUploadZone } from './document-upload-zone';
import { DocumentList } from './document-list';
import { useCreateApplication } from '@/hooks/applications/use-create-application';
import { useUpdateApplication } from '@/hooks/applications/use-update-application';
import { useApplicationDetail } from '@/hooks/applications/use-application-detail';
import type { ApplicationDocument } from '@/lib/applications/types';

interface Props {
  opportunityId: string;
  opportunityTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingDraftId?: string;
}

export function ApplyDrawer({ opportunityId, opportunityTitle, open, onOpenChange, existingDraftId }: Props) {
  const [coverLetter, setCoverLetter] = useState('');
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const createMutation = useCreateApplication();
  const updateMutation = useUpdateApplication(existingDraftId ?? '');
  const { data: existingDraft } = useApplicationDetail(existingDraftId ?? '', undefined);

  // Load existing draft
  useEffect(() => {
    if (existingDraft) {
      setCoverLetter(existingDraft.cover_letter ?? '');
      setDocuments(existingDraft.documents ?? []);
    }
  }, [existingDraft]);

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Close anyway?')) return;
    }
    onOpenChange(false);
  }, [hasUnsavedChanges, onOpenChange]);

  const canSubmit = coverLetter.replace(/<[^>]*>/g, '').trim().length > 0 && documents.length > 0 && confirmed;

  const handleSaveAsDraft = async () => {
    try {
      if (existingDraftId && existingDraft) {
        await updateMutation.mutateAsync({ cover_letter: coverLetter, version: existingDraft.version });
      } else {
        await createMutation.mutateAsync({ opportunity_id: opportunityId, cover_letter: coverLetter, status: 'draft' });
      }
      setHasUnsavedChanges(false);
      onOpenChange(false);
    } catch { /* error handled by mutation */ }
  };

  const handleSubmit = async () => {
    try {
      if (existingDraftId && existingDraft) {
        await updateMutation.mutateAsync({ cover_letter: coverLetter, status: 'submitted', version: existingDraft.version });
      } else {
        await createMutation.mutateAsync({ opportunity_id: opportunityId, cover_letter: coverLetter, status: 'submitted' });
      }
      setHasUnsavedChanges(false);
      onOpenChange(false);
    } catch { /* error handled by mutation */ }
  };

  if (!open) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900 truncate">Apply to {opportunityTitle}</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* Eligibility */}
          <ApplyEligibilityCheck opportunityId={opportunityId} />

          {/* Match Score */}
          <div className="pt-4 border-t border-slate-100">
            <ApplyMatchScore opportunityId={opportunityId} />
          </div>

          {/* Cover Letter */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-800 mb-3">
              Cover Letter <span className="text-red-500">*</span>
            </h4>
            <CoverLetterEditor
              value={coverLetter}
              onChange={(val) => { setCoverLetter(val); setHasUnsavedChanges(true); }}
              placeholder="Tell the employer why you're a great fit for this opportunity..."
            />
          </div>

          {/* Documents */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-800 mb-3">
              Documents <span className="text-red-500">*</span>
            </h4>
            {documents.length > 0 && (
              <div className="mb-3">
                <DocumentList documents={documents} />
              </div>
            )}
            <DocumentUploadZone
              applicationId={existingDraftId ?? 'new'}
              currentDocumentCount={documents.length}
              maxDocuments={5}
              onUploadComplete={(doc) => {
                setDocuments((prev) => [...prev, doc as ApplicationDocument]);
                setHasUnsavedChanges(true);
              }}
            />
          </div>

          {/* Confirmation */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-800 mb-3">Review & Submit</h4>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600 space-y-1">
              <p>\u2022 Cover letter: {coverLetter.replace(/<[^>]*>/g, '').trim().length > 0 ? '\u2713 Provided' : '\u2717 Missing'}</p>
              <p>\u2022 Documents: {documents.length} uploaded</p>
            </div>
            <button
              onClick={() => setConfirmed(!confirmed)}
              className="flex items-center gap-2 mt-3 text-sm text-slate-700"
            >
              {confirmed ? (
                <CheckSquare className="w-4 h-4 text-cyan-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              I confirm this information is accurate
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={handleSaveAsDraft}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Save as Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isPending}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors',
              canSubmit && !isPending
                ? 'text-white bg-cyan-600 hover:bg-cyan-700'
                : 'text-slate-400 bg-slate-100 cursor-not-allowed'
            )}
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
}
