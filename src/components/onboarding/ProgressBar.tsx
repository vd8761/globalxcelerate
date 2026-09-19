'use client';

import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StepStatus } from '@/lib/onboarding/types';
import { STEPS } from '@/lib/onboarding/step-config';

interface ProgressBarProps {
  currentStep: number;
  stepStatuses: Record<string, StepStatus>;
  completionPercentage: number;
  onStepClick?: (stepNum: number) => void;
}

export function ProgressBar({ currentStep, stepStatuses, completionPercentage, onStepClick }: ProgressBarProps) {
  return (
    <div className="mb-8" role="progressbar" aria-valuenow={completionPercentage} aria-valuemin={0} aria-valuemax={100} aria-label="Onboarding progress">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500">Step {currentStep} of 8</span>
        <span className="text-sm font-medium text-slate-700">{completionPercentage}% Complete</span>
      </div>

      {/* Segmented bar */}
      <div className="flex gap-1 mb-4">
        {STEPS.map((step) => {
          const status = stepStatuses[step.slug] ?? 'pending';
          const isActive = step.number === currentStep;
          return (
            <div
              key={step.slug}
              className={cn(
                'h-2 flex-1 rounded-full transition-all duration-300 ease-in-out',
                status === 'completed' && 'bg-slate-700',
                isActive && status !== 'completed' && 'bg-[hsl(187,96%,42%)]',
                status === 'skipped' && !isActive && 'bg-slate-300',
                status === 'pending' && !isActive && 'bg-slate-200',
              )}
            />
          );
        })}
      </div>

      {/* Step circles */}
      <div className="hidden sm:flex items-center justify-between">
        {STEPS.map((step) => {
          const status = stepStatuses[step.slug] ?? 'pending';
          const isActive = step.number === currentStep;
          const isClickable = status === 'completed' || status === 'skipped';
          return (
            <button
              key={step.slug}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick?.(step.number)}
              className={cn(
                'flex flex-col items-center gap-1 group',
                isClickable && 'cursor-pointer',
                !isClickable && 'cursor-default',
              )}
              aria-label={`${step.label} - ${status}`}
            >
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200',
                  status === 'completed' && 'bg-slate-700 text-white',
                  isActive && status !== 'completed' && 'bg-[hsl(187,96%,42%)] text-white shadow-md shadow-cyan-200',
                  status === 'skipped' && !isActive && 'bg-slate-300 text-slate-500',
                  status === 'pending' && !isActive && 'bg-slate-200 text-slate-400',
                  isClickable && 'group-hover:scale-110',
                )}
              >
                {status === 'completed' ? (
                  <Check className="w-3.5 h-3.5" />
                ) : status === 'skipped' ? (
                  <Minus className="w-3.5 h-3.5" />
                ) : (
                  step.number
                )}
              </div>
              <span className={cn(
                'text-[10px] font-medium hidden lg:block',
                isActive ? 'text-slate-700' : 'text-slate-400',
              )}>
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
