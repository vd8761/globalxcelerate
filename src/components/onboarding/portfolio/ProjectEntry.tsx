'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import type { PortfolioItem } from '@/lib/onboarding/types';

interface ProjectEntryProps {
  item: PortfolioItem;
  onUpdate: (data: Partial<PortfolioItem>) => void;
  onDelete: () => void;
  section: string;
}

export function ProjectEntry({ item, onUpdate, onDelete, section }: ProjectEntryProps) {
  const [expanded, setExpanded] = useState(!item.title);

  if (!expanded) {
    return (
      <div className="bg-slate-50 rounded-lg border border-slate-100 p-3 flex items-center justify-between group">
        <button type="button" onClick={() => setExpanded(true)} className="flex-1 text-left">
          <p className="text-sm font-medium text-slate-800 truncate">{item.title || 'Untitled'}</p>
          {item.date_value && <p className="text-xs text-slate-500">{item.date_value}</p>}
        </button>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
          <button type="button" onClick={() => setExpanded(true)} className="p-1.5 text-slate-400"><ChevronDown className="w-4 h-4" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 capitalize">{section}</span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
          <button type="button" onClick={() => setExpanded(false)} className="p-1.5 text-slate-400"><ChevronUp className="w-4 h-4" /></button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
        <input
          value={item.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
          placeholder={section === 'project' ? 'Project name' : section === 'publication' ? 'Publication title' : 'Achievement title'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={item.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={3}
          maxLength={2000}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none resize-none"
          placeholder="Describe this work..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
          <input
            value={item.url}
            onChange={(e) => onUpdate({ url: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            type="month"
            value={item.date_value}
            onChange={(e) => onUpdate({ date_value: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
          />
        </div>
      </div>

      {/* Section-specific fields */}
      {section === 'publication' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Venue / Journal</label>
            <input
              value={item.venue}
              onChange={(e) => onUpdate({ venue: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
              placeholder="e.g., IEEE Conference"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">DOI</label>
            <input
              value={item.doi}
              onChange={(e) => onUpdate({ doi: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
              placeholder="10.xxxx/..."
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Co-Authors</label>
            <input
              value={item.co_authors}
              onChange={(e) => onUpdate({ co_authors: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
              placeholder="Names of co-authors"
            />
          </div>
        </div>
      )}

      {section === 'achievement' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Issuer</label>
            <input
              value={item.issuer}
              onChange={(e) => onUpdate({ issuer: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
              placeholder="Organization that issued this"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Credential URL</label>
            <input
              value={item.credential_url}
              onChange={(e) => onUpdate({ credential_url: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
              placeholder="https://credential.net/..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
