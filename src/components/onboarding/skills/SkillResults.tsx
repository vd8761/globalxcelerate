'use client';

import { Loader2 } from 'lucide-react';
import { SKILL_CATEGORIES } from '@/lib/onboarding/constants';
import { cn } from '@/lib/utils';

interface SkillResultsProps {
  results: { id: string; name: string; category: string }[];
  isLoading: boolean;
  onSelect: (skill: { id: string; name: string; category: string }) => void;
  query: string;
}

export function SkillResults({ results, isLoading, onSelect, query }: SkillResultsProps) {
  if (isLoading) {
    return (
      <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg p-4 flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        <span className="text-sm text-slate-400 ml-2">Searching...</span>
      </div>
    );
  }

  if (results.length === 0 && query.length >= 2) {
    return (
      <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg p-3">
        <p className="text-sm text-slate-400 text-center">No skills found. Add as custom skill below.</p>
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
      {results.map((skill) => {
        const cat = SKILL_CATEGORIES.find((c) => c.value === skill.category);
        return (
          <button
            key={skill.id}
            type="button"
            onClick={() => onSelect(skill)}
            className="w-full px-3 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors flex items-center justify-between"
          >
            <span className="text-slate-700">{skill.name}</span>
            {cat && (
              <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', cat.color)}>
                {cat.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
