'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useApplicationStatus } from '@/hooks/applications/use-application-status';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  applicationVersion: number;
  onWithdrawn: () => void;
}

export function WithdrawalDialog({ open, onOpenChange, applicationId, applicationVersion, onWithdrawn }: Props) {
  const [reason, setReason] = useState('');
  const mutation = useApplicationStatus(applicationId);
  const charCount = reason.trim().length;
  const isValid = charCount >= 10;

  if (!open) return null;

  const handleWithdraw = async () => {
    try {
      await mutation.mutateAsync({
        to_status: 'withdrawn',
        withdrawal_reason: reason.trim(),
        version: applicationVersion,
      });
      setReason('');
      onWithdrawn();
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Withdraw Application</h3>
            <p className="text-xs text-slate-500">This action cannot be undone</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          Your application will be permanently withdrawn. The employer will be notified.
        </p>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Reason for withdrawal <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please explain why you're withdrawing (min. 10 characters)..."
            rows={4}
            maxLength={500}
            className="w-full p-3 text-sm rounded-lg border border-slate-200 focus:border-red-300 focus:ring-2 focus:ring-red-100 outline-none resize-none transition-all placeholder:text-slate-400"
          />
          <div className="flex justify-between">
            <span className="text-xs text-slate-400">
              {charCount < 10 ? `${10 - charCount} more characters needed` : 'Valid'}
            </span>
            <span className="text-xs text-slate-400">{charCount}/500</span>
          </div>
        </div>

        {mutation.isError && (
          <p className="text-xs text-red-600 mt-3">{mutation.error.message}</p>
        )}

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleWithdraw}
            disabled={!isValid || mutation.isPending}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}
