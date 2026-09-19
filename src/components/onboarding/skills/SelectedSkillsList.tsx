'use client';

import { X } from 'lucide-react';
import type { SkillEntry } from '@/lib/onboarding/types';
import { ProficiencySelector } from './ProficiencySelector';
import { SKILL_CATEGORIES } from '@/lib/onboarding/constants';
import { cn } from '@/lib/utils';

interface SelectedSkillsListProps {
  skills: SkillEntry[];
  onUpdateProficiency: (id: string, proficiency: number) => void;
  onRemove: (id: string) => void;
}

export function SelectedSkillsList({ skills, onUpdateProficiency, onRemove }: SelectedSkillsListProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-slate-700">Your Skills ({skills.length})</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {skills.map((skill) => {
          const cat = SKILL_CATEGORIES.find((c) => c.value === skill.category);
          return (
            <div
              key={skill.id}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 flex items-center gap-2 group hover:border-slate-300 transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700 truncate">{skill.skill_name}</span>
                  {cat && (
                    <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0', cat.color)}>
                      {cat.label}
                    </span>
                  )}
                </div>
                <ProficiencySelector
                  value={skill.proficiency}
                  onChange={(level) => onUpdateProficiency(skill.id, level)}
                />
              </div>
              <button
                type="button"
                onClick={() => onRemove(skill.id)}
                className="p-1 text-slate-300 hover:text-red-500 shrink-0 opacity-0 group-hover:opacity-100 transition-all"
                aria-label={`Remove ${skill.skill_name}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
