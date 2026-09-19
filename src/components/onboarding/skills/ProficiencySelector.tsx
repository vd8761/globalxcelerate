'use client';

import { PROFICIENCY_LABELS } from '@/lib/onboarding/constants';
import { cn } from '@/lib/utils';

interface ProficiencySelectorProps {
  value: number;
  onChange: (level: number) => void;
}

export function ProficiencySelector({ value, onChange }: ProficiencySelectorProps) {
  return (
    <div className="flex items-center gap-1.5 mt-1" role="radiogroup" aria-label="Proficiency level">
      {[1, 2, 3, 4, 5].map((level) => (
        <button
          key={level}
          type="button"
          role="radio"
          aria-checked={value === level}
          aria-label={PROFICIENCY_LABELS[level]}
          onClick={() => onChange(level)}
          className={cn(
            'w-3 h-3 rounded-full transition-all',
            level <= value
              ? 'bg-cyan-500 scale-110'
              : 'bg-slate-200 hover:bg-slate-300',
          )}
        />
      ))}
      <span className="text-[10px] text-slate-400 ml-1">{PROFICIENCY_LABELS[value]}</span>
    </div>
  );
}
