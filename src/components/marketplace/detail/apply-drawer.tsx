'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApplyMutation } from '@/hooks/marketplace/use-apply-mutation';
import { useApplyDraftStore } from '@/stores/marketplace/apply-draft-store';
import { ApplyCoverLetter } from './apply-cover-letter';
import { ApplyDocumentUpload } from './apply-document-upload';
import { ApplyReview } from './apply-review';
import { ApplySuccess } from './apply-success';
import type { ApplicationDocument } from '@/types/marketplace';

interface ApplyDrawerProps {
  opportunityId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = ['Cover Letter', 'Documents', 'Review'];

export function ApplyDrawer({ opportunityId, open, onOpenChange }: ApplyDrawerProps) {
  const [step, setStep] = useState(0);
  const [coverLetter, setCoverLetter] = useState('');
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  const { mutate, isPending, data, error, reset } = useApplyMutation(opportunityId);
  const { getDraft, saveDraft, clearDraft } = useApplyDraftStore();

  const isSuccess = !!data?.success;

  // Load draft on open
  useEffect(() => {
    if (open) {
      const draft = getDraft(opportunityId);
      if (draft) {
        setCoverLetter(draft.cover_letter);
        setDocuments(draft.documents);
      }
      setStep(0);
      setConfirmed(false);
      reset();
    }
  }, [open, opportunityId]);

  // Auto-save draft
  useEffect(() => {
    if (!open || isSuccess) return;
    const timer = setTimeout(() => {
      saveDraft(opportunityId, { cover_letter: coverLetter, documents });
    }, 5000);
    return () => clearTimeout(timer);
  }, [coverLetter, documents, open, isSuccess]);

  const handleSubmit = () => {
    mutate({
      cover_letter: coverLetter,
      documents,
      additional_answers: {},
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {isSuccess ? 'Application Submitted' : 'Apply'}
            </h2>
            {!isSuccess && (
              <p className="text-xs text-slate-500 mt-0.5">Step {step + 1} of {STEPS.length}</p>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Progress bar */}
        {!isSuccess && (
          <div className="h-1 bg-slate-100">
            <div
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isSuccess ? (
            <ApplySuccess
              referenceNumber={data.data.reference_number}
              onClose={() => {
                clearDraft(opportunityId);
                onOpenChange(false);
              }}
            />
          ) : (
            <>
              {step === 0 && (
                <ApplyCoverLetter
                  value={coverLetter}
                  onChange={setCoverLetter}
                />
              )}
              {step === 1 && (
                <ApplyDocumentUpload
                  opportunityId={opportunityId}
                  documents={documents}
                  onDocumentsChange={setDocuments}
                />
              )}
              {step === 2 && (
                <ApplyReview
                  coverLetter={coverLetter}
                  documents={documents}
                  confirmed={confirmed}
                  onConfirmChange={setConfirmed}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isSuccess && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="flex items-center gap-1 px-3 py-2 text-sm text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:text-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isPending || !confirmed}
                className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="px-6 pb-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {error.message}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
