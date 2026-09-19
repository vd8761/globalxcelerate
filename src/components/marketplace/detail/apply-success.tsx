'use client';

import { CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ApplySuccessProps {
  referenceNumber: string;
  onClose: () => void;
}

export function ApplySuccess({ referenceNumber, onClose }: ApplySuccessProps) {
  return (
    <div className="flex flex-col items-center text-center py-8">
      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-emerald-500" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2">Application Submitted!</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-xs">
        Your application has been successfully submitted. You will receive a confirmation email shortly.
      </p>

      {/* Reference number */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 mb-8">
        <p className="text-xs text-slate-500 mb-1">Reference Number</p>
        <p className="text-lg font-mono font-bold text-slate-900">{referenceNumber}</p>
      </div>

      <div className="space-y-3 w-full max-w-xs">
        <Link
          href="/student/marketplace"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          Back to Marketplace
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
