'use client';

import { cn } from '@/lib/utils';

const LEVELS = [
  { value: 1, label: 'Not Ready' },
  { value: 2, label: 'Somewhat' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'Very Ready' },
  { value: 5, label: 'Fully Mobile' },
];

interface MobilityReadinessSliderProps {
  value: number | null;
  onChange: (value: number) => void;
}

export function MobilityReadinessSlider({ value, onChange }: MobilityReadinessSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        {LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => onChange(level.value)}
            className="flex flex-col items-center gap-1"
          >
            <div
              className={cn(
                'w-6 h-6 rounded-full border-2 transition-all',
                value === level.value
                  ? 'bg-slate-800 border-slate-800 scale-125'
                  : value && value >= level.value
                    ? 'bg-slate-400 border-slate-400'
                    : 'bg-white border-slate-300 hover:border-slate-400',
              )}
            />
            <span className={cn(
              'text-[9px] font-medium text-center leading-tight',
              value === level.value ? 'text-slate-700' : 'text-slate-400',
            )}>
              {level.label}
            </span>
          </button>
        ))}
      </div>
      <div className="h-0.5 bg-slate-200 rounded-full relative -mt-5 mx-3 -z-10">
        <div
          className="h-full bg-slate-400 rounded-full transition-all"
          style={{ width: `${((value ?? 0) - 1) * 25}%` }}
        />
      </div>
    </div>
  );
}
