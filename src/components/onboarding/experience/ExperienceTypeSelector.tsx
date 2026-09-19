'use client';

import * as Icons from 'lucide-react';
import { EXPERIENCE_TYPES } from '@/lib/onboarding/constants';
import type { ExperienceTypeEnum } from '@/lib/onboarding/types';

interface ExperienceTypeSelectorProps {
  onSelectType: (type: ExperienceTypeEnum) => void;
}

export function ExperienceTypeSelector({ onSelectType }: ExperienceTypeSelectorProps) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700 block mb-3">Add experience by type:</label>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {EXPERIENCE_TYPES.map((type) => {
          const IconComp = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[type.icon] ?? Icons.Circle;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onSelectType(type.value as ExperienceTypeEnum)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <IconComp className="w-5 h-5 text-slate-600" />
              <span className="text-[11px] font-medium text-slate-600 text-center leading-tight">{type.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
