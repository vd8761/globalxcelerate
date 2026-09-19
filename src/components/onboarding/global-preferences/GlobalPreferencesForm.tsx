'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { GlobalPreferencesData } from '@/lib/onboarding/types';
import { LanguageList } from './LanguageList';
import { ProgramTypeSelector } from './ProgramTypeSelector';
import { RelocationSection } from './RelocationSection';
import { X, Plus } from 'lucide-react';
import { useState } from 'react';

interface GlobalPreferencesFormProps {
  form: UseFormReturn<GlobalPreferencesData>;
}

export function GlobalPreferencesForm({ form }: GlobalPreferencesFormProps) {
  const { watch, setValue } = form;
  const [newInterest, setNewInterest] = useState('');

  const culturalInterests = watch('cultural_interests') ?? [];

  const addInterest = () => {
    const trimmed = newInterest.trim();
    if (trimmed.length >= 2 && culturalInterests.length < 10 && !culturalInterests.includes(trimmed)) {
      setValue('cultural_interests', [...culturalInterests, trimmed], { shouldDirty: true });
      setNewInterest('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Languages */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Languages</h3>
        <LanguageList
          languages={watch('languages') ?? []}
          onChange={(langs) => setValue('languages', langs, { shouldDirty: true })}
        />
      </div>

      {/* Program Types */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Preferred Program Types</h3>
        <ProgramTypeSelector
          selected={watch('preferred_program_types') ?? []}
          onChange={(types) => setValue('preferred_program_types', types, { shouldDirty: true })}
        />
      </div>

      {/* Relocation */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Relocation Willingness</h3>
        <RelocationSection
          willingness={watch('relocation_willingness') ?? ''}
          conditions={watch('relocation_conditions') ?? ''}
          onChange={(data) => {
            if (data.willingness !== undefined) setValue('relocation_willingness', data.willingness, { shouldDirty: true });
            if (data.conditions !== undefined) setValue('relocation_conditions', data.conditions, { shouldDirty: true });
          }}
        />
      </div>

      {/* Cultural Interests */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Cultural Interests</h3>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {culturalInterests.map((interest) => (
            <span key={interest} className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {interest}
              <button type="button" onClick={() => setValue('cultural_interests', culturalInterests.filter((ci) => ci !== interest), { shouldDirty: true })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        {culturalInterests.length < 10 && (
          <div className="flex gap-2">
            <input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
              placeholder="e.g., Japanese Culture, Sustainability"
              maxLength={50}
            />
            <button type="button" onClick={addInterest} className="px-3 py-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Travel */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Travel Experience</h3>
        <select
          value={watch('travel_experience') ?? ''}
          onChange={(e) => setValue('travel_experience', e.target.value as GlobalPreferencesData['travel_experience'], { shouldDirty: true })}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
        >
          <option value="">Select travel experience</option>
          <option value="none">No international travel</option>
          <option value="1_2_countries">1-2 countries</option>
          <option value="3_5_countries">3-5 countries</option>
          <option value="6_10_countries">6-10 countries</option>
          <option value="10_plus_countries">10+ countries</option>
        </select>
      </div>
    </div>
  );
}
