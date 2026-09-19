'use client';

import { ArrowLeft, ArrowRight, SkipForward, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationFooterProps {
  onBack?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  canSkip?: boolean;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  nextLabel?: string;
}

export function NavigationFooter({
  onBack,
  onNext,
  onSkip,
  isFirstStep = false,
  isLastStep = false,
  canSkip = false,
  isNextDisabled = false,
  isLoading = false,
  nextLabel,
}: NavigationFooterProps) {
  const label = nextLabel ?? (isLastStep ? 'Review Profile' : 'Save & Continue');

  return (
    <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
      {/* Back */}
      <div className="flex-1">
        {!isFirstStep && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
      </div>

      {/* Skip */}
      <div className="flex-1 flex justify-center">
        {canSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Skip
          </button>
        )}
      </div>

      {/* Next */}
      <div className="flex-1 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled || isLoading}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200',
            'bg-slate-800 text-white hover:bg-slate-700 shadow-sm hover:shadow-md',
            'focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2',
            (isNextDisabled || isLoading) && 'opacity-50 cursor-not-allowed',
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : null}
          {label}
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
