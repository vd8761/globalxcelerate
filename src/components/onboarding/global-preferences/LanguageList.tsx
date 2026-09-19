'use client';

import { Plus, X } from 'lucide-react';
import type { LanguageEntry, LanguageProficiencyEnum } from '@/lib/onboarding/types';
import { CEFR_LEVELS } from '@/lib/onboarding/constants';
import languagesData from '@/data/languages.json';
import { MAX_LANGUAGES } from '@/lib/onboarding/constants';

interface LanguageListProps {
  languages: LanguageEntry[];
  onChange: (languages: LanguageEntry[]) => void;
}

export function LanguageList({ languages, onChange }: LanguageListProps) {
  const allLanguages = languagesData as { code: string; name: string }[];
  const usedCodes = languages.map((l) => l.language_code);

  const addLanguage = () => {
    if (languages.length >= MAX_LANGUAGES) return;
    const newLang: LanguageEntry = {
      id: crypto.randomUUID(),
      language_code: '',
      language_name: '',
      proficiency: 'b1',
      is_native: false,
      display_order: languages.length,
    };
    onChange([...languages, newLang]);
  };

  const updateLanguage = (id: string, data: Partial<LanguageEntry>) => {
    onChange(languages.map((l) => (l.id === id ? { ...l, ...data } : l)));
  };

  const removeLanguage = (id: string) => {
    onChange(languages.filter((l) => l.id !== id));
  };

  return (
    <div className="space-y-3">
      {languages.map((lang) => (
        <div key={lang.id} className="flex items-center gap-2">
          <select
            value={lang.language_code}
            onChange={(e) => {
              const langData = allLanguages.find((l) => l.code === e.target.value);
              updateLanguage(lang.id, {
                language_code: e.target.value,
                language_name: langData?.name ?? '',
              });
            }}
            className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
          >
            <option value="">Select language</option>
            {allLanguages.map((l) => (
              <option key={l.code} value={l.code} disabled={usedCodes.includes(l.code) && lang.language_code !== l.code}>
                {l.name}
              </option>
            ))}
          </select>
          <select
            value={lang.proficiency}
            onChange={(e) => {
              const prof = e.target.value as LanguageProficiencyEnum;
              updateLanguage(lang.id, {
                proficiency: prof,
                is_native: prof === 'native',
              });
            }}
            className="w-40 px-2 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
          >
            {CEFR_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => removeLanguage(lang.id)}
            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {languages.length < MAX_LANGUAGES && (
        <button
          type="button"
          onClick={addLanguage}
          className="inline-flex items-center gap-1.5 text-sm text-cyan-600 hover:text-cyan-700 font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Language
        </button>
      )}

      {languages.length === 0 && (
        <p className="text-xs text-slate-400">Add languages you speak</p>
      )}
    </div>
  );
}
