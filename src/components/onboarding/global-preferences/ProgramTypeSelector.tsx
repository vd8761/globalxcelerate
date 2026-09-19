'use client';

import { PROGRAM_TYPES } from '@/lib/onboarding/constants';
import type { ProgramTypeEnum } from '@/lib/onboarding/types';
import { cn } from '@/lib/utils';

interface ProgramTypeSelectorProps {
  selected: ProgramTypeEnum[];
  onChange: (types: ProgramTypeEnum[]) => void;
}

export function ProgramTypeSelector({ selected, onChange }: ProgramTypeSelectorProps) {
  const toggle = (type: ProgramTypeEnum) => {
    if (selected.includes(type)) {
      onChange(selected.filter((t) => t !== type));
    } else {
      onChange([...selected, type]);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {PROGRAM_TYPES.map((program) => {
        const isSelected = selected.includes(program.value as ProgramTypeEnum);
        return (
          <button
            key={program.value}
            type="button"
            onClick={() => toggle(program.value as ProgramTypeEnum)}
            className={cn(
              'text-left p-3 rounded-lg border transition-all',
              isSelected
                ? 'bg-cyan-50 border-cyan-300 ring-1 ring-cyan-200'
                : 'bg-white border-slate-200 hover:border-slate-300',
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-slate-300',
              )}>
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium text-slate-700">{program.label}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-6">{program.description}</p>
          </button>
        );
      })}
    </div>
  );
}
