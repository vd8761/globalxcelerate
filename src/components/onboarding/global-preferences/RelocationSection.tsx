'use client';

import { cn } from '@/lib/utils';
import type { RelocationEnum } from '@/lib/onboarding/types';

interface RelocationSectionProps {
  willingness: string;
  conditions: string;
  onChange: (data: { willingness?: string; conditions?: string }) => void;
}

const OPTIONS: { value: RelocationEnum; label: string }[] = [
  { value: 'yes', label: 'Yes (anywhere)' },
  { value: 'yes_with_conditions', label: 'Yes (with conditions)' },
  { value: 'no', label: 'No' },
  { value: 'undecided', label: 'Undecided' },
];

export function RelocationSection({ willingness, conditions, onChange }: RelocationSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ willingness: opt.value })}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all border',
              willingness === opt.value
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {willingness === 'yes_with_conditions' && (
        <div className="animate-fade-in">
          <textarea
            value={conditions}
            onChange={(e) => onChange({ conditions: e.target.value })}
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none resize-none"
            placeholder="Describe your conditions (e.g., English-speaking countries, specific regions...)"
          />
          <span className="text-xs text-slate-400">{conditions.length}/500</span>
        </div>
      )}
    </div>
  );
}
