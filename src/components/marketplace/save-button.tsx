'use client';

import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSaveOpportunity } from '@/hooks/marketplace/use-save-opportunity';
import { useSavedOpportunitiesStore } from '@/stores/marketplace/saved-opportunities-store';

interface SaveButtonProps {
  opportunityId: string;
  initialSaved: boolean;
  variant?: 'card' | 'detail';
}

export function SaveButton({ opportunityId, initialSaved, variant = 'card' }: SaveButtonProps) {
  const { toggleSave } = useSaveOpportunity();
  const isSavedInStore = useSavedOpportunitiesStore((s) => s.savedIds.has(opportunityId));
  const isSaved = isSavedInStore || initialSaved;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave(opportunityId, isSaved);
  };

  if (variant === 'detail') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
          isSaved
            ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
        )}
      >
        <Heart className={cn('w-4 h-4', isSaved && 'fill-cyan-500 text-cyan-500')} />
        {isSaved ? 'Saved' : 'Save'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-full hover:bg-slate-100 transition-all"
      aria-label={isSaved ? 'Unsave' : 'Save'}
    >
      <Heart className={cn(
        'w-5 h-5 transition-all',
        isSaved ? 'fill-cyan-500 text-cyan-500' : 'text-slate-400'
      )} />
    </button>
  );
}
