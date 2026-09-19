'use client';

import { X } from 'lucide-react';
import type { ExternalLinkEntry } from '@/lib/onboarding/types';

interface ExternalLinkRowProps {
  link: ExternalLinkEntry;
  onUpdate: (data: Partial<ExternalLinkEntry>) => void;
  onDelete: () => void;
}

const LABEL_SUGGESTIONS = ['GitHub', 'LinkedIn', 'Personal Website', 'Behance', 'Dribbble', 'Twitter', 'Medium', 'Portfolio'];

export function ExternalLinkRow({ link, onUpdate, onDelete }: ExternalLinkRowProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-36">
        <input
          value={link.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          list={`link-labels-${link.id}`}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
          placeholder="Label"
          maxLength={50}
        />
        <datalist id={`link-labels-${link.id}`}>
          {LABEL_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
        </datalist>
      </div>
      <div className="flex-1">
        <input
          value={link.url}
          onChange={(e) => onUpdate({ url: e.target.value })}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
          placeholder="https://..."
        />
      </div>
      <button type="button" onClick={onDelete} className="p-2 text-slate-400 hover:text-red-500">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
