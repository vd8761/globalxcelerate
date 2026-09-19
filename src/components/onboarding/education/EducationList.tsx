'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { EducationEntry } from '@/lib/onboarding/types';
import { EducationEntryCard } from './EducationEntryCard';
import { MAX_EDUCATION_ENTRIES } from '@/lib/onboarding/constants';

interface EducationListProps {
  entries: EducationEntry[];
  onUpdate: (entries: EducationEntry[]) => void;
}

export function EducationList({ entries, onUpdate }: EducationListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    entries.length === 0 ? null : entries[0]?.id ?? null
  );

  const addEntry = () => {
    const newEntry: EducationEntry = {
      id: crypto.randomUUID(),
      institution_name: '',
      institution_id: null,
      degree_level: '',
      field_of_study: '',
      field_of_study_id: null,
      gpa_value: null,
      gpa_scale: null,
      gpa_normalized: null,
      start_date: '',
      end_date: null,
      is_current: false,
      description: '',
      honors: '',
      thesis_title: '',
      display_order: entries.length,
    };
    onUpdate([...entries, newEntry]);
    setExpandedId(newEntry.id);
  };

  const updateEntry = (id: string, updated: Partial<EducationEntry>) => {
    onUpdate(entries.map((e) => (e.id === id ? { ...e, ...updated } : e)));
  };

  const deleteEntry = (id: string) => {
    onUpdate(entries.filter((e) => e.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="space-y-4">
      {entries.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <p className="text-sm text-slate-500">Add at least one education entry to continue</p>
        </div>
      )}

      {entries.map((entry) => (
        <EducationEntryCard
          key={entry.id}
          entry={entry}
          isExpanded={expandedId === entry.id}
          onToggleExpand={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
          onUpdate={(updated) => updateEntry(entry.id, updated)}
          onDelete={() => deleteEntry(entry.id)}
        />
      ))}

      {entries.length < MAX_EDUCATION_ENTRIES && (
        <button
          type="button"
          onClick={addEntry}
          className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:border-cyan-300 hover:text-cyan-600 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      )}
    </div>
  );
}
