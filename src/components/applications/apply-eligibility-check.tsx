'use client';

import { Check, X, Loader2 } from 'lucide-react';
import { useEligibilityCheck } from '@/hooks/applications/use-eligibility-check';
import { cn } from '@/lib/utils';

interface Props {
  opportunityId: string;
  onEligible?: () => void;
}

export function ApplyEligibilityCheck({ opportunityId, onEligible }: Props) {
  const { data, isLoading } = useEligibilityCheck(opportunityId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
        <span className="text-sm text-slate-500">Checking eligibility...</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-800">Eligibility Check</h4>
      <div className="space-y-2">
        {data.checks.map((check) => (
          <div key={check.name} className="flex items-center gap-2.5">
            <div
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                check.passed ? 'bg-emerald-100' : 'bg-red-100'
              )}
            >
              {check.passed ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <X className="w-3 h-3 text-red-600" />
              )}
            </div>
            <span className={cn('text-sm', check.passed ? 'text-slate-700' : 'text-red-700')}>
              {check.message}
            </span>
          </div>
        ))}
      </div>
      {data.isEligible && (
        <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
          <p className="text-xs font-medium text-emerald-700 text-center">
            \u2713 You&apos;re eligible to apply!
          </p>
        </div>
      )}
    </div>
  );
}
