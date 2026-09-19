'use client';

import { ChevronDown, ChevronUp, Trash2, GraduationCap } from 'lucide-react';
import type { EducationEntry } from '@/lib/onboarding/types';
import { DEGREE_LEVELS, GPA_SCALES } from '@/lib/onboarding/constants';
import { InstitutionAutocomplete } from './InstitutionAutocomplete';
import { cn } from '@/lib/utils';

interface EducationEntryCardProps {
  entry: EducationEntry;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (data: Partial<EducationEntry>) => void;
  onDelete: () => void;
}

export function EducationEntryCard({ entry, isExpanded, onToggleExpand, onUpdate, onDelete }: EducationEntryCardProps) {
  const degreeLabel = DEGREE_LEVELS.find((d) => d.value === entry.degree_level)?.label;

  if (!isExpanded) {
    return (
      <div className="bg-slate-50 rounded-lg border border-slate-100 p-4 flex items-center justify-between group">
        <button type="button" onClick={onToggleExpand} className="flex items-center gap-3 flex-1 text-left">
          <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-slate-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">
              {entry.institution_name || 'Untitled Education'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {degreeLabel}{entry.field_of_study ? ` in ${entry.field_of_study}` : ''}
            </p>
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
        <h4 className="text-sm font-semibold text-slate-700">Education Entry</h4>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
          <button type="button" onClick={onToggleExpand} className="p-1.5 text-slate-400">
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Institution */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Institution <span className="text-red-500">*</span></label>
        <InstitutionAutocomplete
          value={entry.institution_name}
          onSelect={(name, id) => onUpdate({ institution_name: name, institution_id: id ?? null })}
        />
      </div>

      {/* Degree and Field */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Degree Level <span className="text-red-500">*</span></label>
          <select
            value={entry.degree_level}
            onChange={(e) => onUpdate({ degree_level: e.target.value as EducationEntry['degree_level'] })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
          >
            <option value="">Select degree</option>
            {DEGREE_LEVELS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Field of Study <span className="text-red-500">*</span></label>
          <input
            value={entry.field_of_study}
            onChange={(e) => onUpdate({ field_of_study: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
            placeholder="e.g., Computer Science"
          />
        </div>
      </div>

      {/* GPA */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">GPA</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={entry.gpa_value ?? ''}
            onChange={(e) => onUpdate({ gpa_value: e.target.value ? parseFloat(e.target.value) : null })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
            placeholder="e.g., 3.5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Scale</label>
          <select
            value={entry.gpa_scale ?? ''}
            onChange={(e) => onUpdate({ gpa_scale: e.target.value ? parseFloat(e.target.value) : null })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
          >
            <option value="">Select scale</option>
            {GPA_SCALES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dates */}
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
            <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">Currently studying</div>
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
        <span className="text-sm text-slate-600">I&apos;m currently studying here</span>
      </label>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={entry.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={2}
          maxLength={1000}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none resize-none"
          placeholder="Activities, achievements, relevant coursework..."
        />
      </div>

      {/* Honors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Honors</label>
          <input
            value={entry.honors}
            onChange={(e) => onUpdate({ honors: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
            placeholder="e.g., Magna Cum Laude"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Thesis Title</label>
          <input
            value={entry.thesis_title}
            onChange={(e) => onUpdate({ thesis_title: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
            placeholder="If applicable"
          />
        </div>
      </div>
    </div>
  );
}
