'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { SkillCategoryEnum } from '@/lib/onboarding/types';
import { SKILL_CATEGORIES } from '@/lib/onboarding/constants';

interface CustomSkillInputProps {
  onAdd: (name: string, category: SkillCategoryEnum) => void;
  existingNames: string[];
}

export function CustomSkillInput({ onAdd, existingNames }: CustomSkillInputProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SkillCategoryEnum>('technical');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Minimum 2 characters');
      return;
    }
    if (existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      setError('This skill is already in your list');
      return;
    }
    onAdd(trimmed, category);
    setName('');
    setError('');
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-500">Can&apos;t find a skill? Add it manually:</label>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
          placeholder="Skill name"
          maxLength={60}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as SkillCategoryEnum)}
          className="px-2 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
        >
          {SKILL_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAdd}
          disabled={name.trim().length < 2}
          className="px-3 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
