'use client';

import { STEPS } from '@/lib/onboarding/step-config';
import { cn } from '@/lib/utils';

interface CompletionBreakdownProps {
  perStepCompletion: Record<string, number>;
}

const COLORS: Record<string, string> = {
  identity: 'bg-slate-700',
  education: 'bg-blue-500',
  skills: 'bg-cyan-500',
  experience: 'bg-emerald-500',
  'career-goals': 'bg-purple-500',
  'global-preferences': 'bg-orange-500',
  portfolio: 'bg-pink-500',
};

export function CompletionBreakdown({ perStepCompletion }: CompletionBreakdownProps) {
  const steps = STEPS.filter((s) => s.number < 8);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-700">Profile Completion Breakdown</h4>

      {/* Stacked bar */}
      <div className="h-4 rounded-full overflow-hidden flex bg-slate-100">
        {steps.map((step) => {
          const pct = (perStepCompletion[step.slug] ?? 0) * step.weight / steps.reduce((a, s) => a + s.weight, 0) * 100;
          return (
            <div
              key={step.slug}
              className={cn('h-full transition-all', COLORS[step.slug])}
              style={{ width: `${Math.max(pct, 0)}%` }}
              title={`${step.label}: ${perStepCompletion[step.slug] ?? 0}%`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {steps.map((step) => (
          <div key={step.slug} className="flex items-center gap-1.5">
            <div className={cn('w-2.5 h-2.5 rounded-full', COLORS[step.slug])} />
            <span className="text-[11px] text-slate-600">
              {step.label} ({perStepCompletion[step.slug] ?? 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
