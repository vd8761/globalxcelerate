'use client';

import { useState } from 'react';
import { Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  content: string | null;
  showEditButton?: boolean;
  onEdit?: () => void;
}

export function CoverLetterDisplay({ content, showEditButton, onEdit }: Props) {
  const [expanded, setExpanded] = useState(false);
  const isLong = content && content.length > 800;

  if (!content) {
    return (
      <div className="flex items-center justify-center py-8 rounded-lg bg-slate-50 border border-dashed border-slate-200">
        <p className="text-sm text-slate-400">No cover letter provided</p>
        {showEditButton && onEdit && (
          <button
            onClick={onEdit}
            className="ml-3 text-xs font-medium text-cyan-700 hover:text-cyan-800"
          >
            Write one
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className={cn(
          'prose prose-sm prose-slate max-w-none text-slate-700 leading-relaxed',
          !expanded && isLong && 'max-h-[200px] overflow-hidden'
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {isLong && !expanded && (
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      )}
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-cyan-700 hover:text-cyan-800"
        >
          {expanded ? (
            <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
          ) : (
            <><ChevronDown className="w-3.5 h-3.5" /> Show more</>
          )}
        </button>
      )}
      {showEditButton && onEdit && (
        <button
          onClick={onEdit}
          className="absolute top-0 right-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Edit cover letter"
        >
          <Pencil className="w-3.5 h-3.5 text-slate-400" />
        </button>
      )}
    </div>
  );
}
