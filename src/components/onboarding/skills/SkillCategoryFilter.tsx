'use client';

import { cn } from '@/lib/utils';
import { SKILL_CATEGORIES } from '@/lib/onboarding/constants';

interface SkillCategoryFilterProps {
  activeCategory: string | null;
  onSelect: (category: string | null) => void;
}

export function SkillCategoryFilter({ activeCategory, onSelect }: SkillCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
          !activeCategory ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
        )}
      >
        All
      </button>
      {SKILL_CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          type="button"
          onClick={() => onSelect(activeCategory === cat.value ? null : cat.value)}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
            activeCategory === cat.value ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
