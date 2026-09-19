'use client';

import { useState } from 'react';
import type { ExperienceEntry } from '@/lib/onboarding/types';
import { ExperienceEntryCard } from './ExperienceEntryCard';

interface ExperienceListProps {
  entries: ExperienceEntry[];
  onUpdate: (entries: ExperienceEntry[]) => void;
  onDelete: (id: string) => void;
}

export function ExperienceList({ entries, onUpdate, onDelete }: ExperienceListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    entries.length > 0 ? entries[entries.length - 1]?.id : null
  );

  if (entries.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-slate-400">No experiences added yet. Select a type above to get started.</p>
      </div>
    );
  }

  const updateEntry = (id: string, data: Partial<ExperienceEntry>) => {
    onUpdate(entries.map((e) => (e.id === id ? { ...e, ...data } : e)));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">{entries.length} experience(s) added</p>
      {entries.map((entry) => (
        <ExperienceEntryCard
          key={entry.id}
          entry={entry}
          isExpanded={expandedId === entry.id}
          onToggleExpand={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
          onUpdate={(data) => updateEntry(entry.id, data)}
          onDelete={() => onDelete(entry.id)}
        />
      ))}
    </div>
  );
}
