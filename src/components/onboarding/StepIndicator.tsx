'use client';

import { cn } from '@/lib/utils';
import { Check, Minus } from 'lucide-react';
import type { StepStatus } from '@/lib/onboarding/types';

interface StepIndicatorProps {
  stepNumber: number;
  label: string;
  status: StepStatus;
  onClick?: () => void;
  disabled?: boolean;
}

export function StepIndicator({ stepNumber, label, status, onClick, disabled }: StepIndicatorProps) {
  const isClickable = !disabled && (status === 'completed' || status === 'skipped');

  return (
    <button
      type="button"
      disabled={!isClickable}
      onClick={() => isClickable && onClick?.()}
      className={cn(
        'flex flex-col items-center gap-1',
        isClickable && 'cursor-pointer',
        !isClickable && 'cursor-default',
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200',
          status === 'completed' && 'bg-slate-700 text-white',
          status === 'active' && 'bg-[hsl(187,96%,42%)] text-white',
          status === 'pending' && 'bg-slate-200 text-slate-500',
          status === 'skipped' && 'bg-slate-300 text-slate-500',
          isClickable && 'hover:scale-110',
        )}
      >
        {status === 'completed' ? (
          <Check className="w-4 h-4" />
        ) : status === 'skipped' ? (
          <Minus className="w-4 h-4" />
        ) : (
          stepNumber
        )}
      </div>
      <span className="text-[10px] font-medium text-slate-500 hidden sm:block">{label}</span>
    </button>
  );
}
