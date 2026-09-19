'use client';

import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import type { ExperienceEntry } from '@/lib/onboarding/types';
import { EXPERIENCE_TYPES } from '@/lib/onboarding/constants';
import { OutcomesList } from './OutcomesList';

interface ExperienceEntryCardProps {
  entry: ExperienceEntry;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (data: Partial<ExperienceEntry>) => void;
  onDelete: () => void;
}

export function ExperienceEntryCard({ entry, isExpanded, onToggleExpand, onUpdate, onDelete }: ExperienceEntryCardProps) {
  const typeInfo = EXPERIENCE_TYPES.find((t) => t.value === entry.type);

  if (!isExpanded) {
    return (
      <div className="bg-slate-50 rounded-lg border border-slate-100 p-4 flex items-center justify-between group">
        <button type="button" onClick={onToggleExpand} className="flex items-center gap-3 flex-1 text-left">
          <span className="text-xs font-medium px-2 py-0.5 bg-slate-200 text-slate-600 rounded">{typeInfo?.label}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{entry.title || 'Untitled'}</p>
            <p className="text-xs text-slate-500 truncate">{entry.organization_name}</p>
          </div>
        </button>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
          <button type="button" onClick={onToggleExpand} className="p-1.5 text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded">{typeInfo?.label}</span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
          <button type="button" onClick={onToggleExpand} className="p-1.5 text-slate-400"><ChevronUp className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
          <input
            value={entry.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
            placeholder="e.g., Software Engineering Intern"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Organization <span className="text-red-500">*</span></label>
          <input
            value={entry.organization_name}
            onChange={(e) => onUpdate({ organization_name: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
            placeholder="Company or organization name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
        <input
          value={entry.location}
          onChange={(e) => onUpdate({ location: e.target.value })}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
          placeholder="e.g., San Francisco, CA"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Start Date <span className="text-red-500">*</span></label>
          <input
            type="month"
            value={entry.start_date}
            onChange={(e) => onUpdate({ start_date: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
          {entry.is_current ? (
            <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">Current position</div>
          ) : (
            <input
              type="month"
              value={entry.end_date ?? ''}
              onChange={(e) => onUpdate({ end_date: e.target.value || null })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
            />
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={entry.is_current}
          onChange={(e) => onUpdate({ is_current: e.target.checked, end_date: e.target.checked ? null : entry.end_date })}
          className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
        />
        <span className="text-sm text-slate-600">I currently work here</span>
      </label>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={entry.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={3}
          maxLength={2000}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none resize-none"
          placeholder="Describe your responsibilities and achievements..."
        />
        <span className="text-xs text-slate-400">{(entry.description ?? '').length}/2000</span>
      </div>

      <OutcomesList
        outcomes={entry.outcomes}
        onChange={(outcomes) => onUpdate({ outcomes })}
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Link / URL</label>
        <input
          value={entry.url}
          onChange={(e) => onUpdate({ url: e.target.value })}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
          placeholder="https://..."
        />
      </div>
    </div>
  );
}
