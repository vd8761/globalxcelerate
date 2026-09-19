'use client';

import { useState } from 'react';
import { Send, Heart, Share2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSaveOpportunity } from '@/hooks/marketplace/use-save-opportunity';
import { useSavedOpportunitiesStore } from '@/stores/marketplace/saved-opportunities-store';
import { ApplyDrawer } from './apply-drawer';
import { ShareModal } from './share-modal';

interface DetailActionCardProps {
  opportunityId: string;
  isExpired: boolean;
  spotsAvailable: number | null;
  spotsFilled: number;
}

export function DetailActionCard({ opportunityId, isExpired, spotsAvailable, spotsFilled }: DetailActionCardProps) {
  const [applyOpen, setApplyOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const { toggleSave } = useSaveOpportunity();
  const isSaved = useSavedOpportunitiesStore((s) => s.savedIds.has(opportunityId));

  const spotsRemaining = spotsAvailable ? spotsAvailable - spotsFilled : null;
  const fillPercentage = spotsAvailable ? (spotsFilled / spotsAvailable) * 100 : 0;

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        {/* Apply button */}
        <button
          onClick={() => setApplyOpen(true)}
          disabled={isExpired}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all',
            isExpired
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-800 text-white hover:bg-slate-700 active:scale-[0.98]'
          )}
        >
          {isExpired ? (
            <><CheckCircle className="w-4 h-4" /> Closed</>
          ) : (
            <><Send className="w-4 h-4" /> Apply Now</>
          )}
        </button>

        {/* Save + Share */}
        <div className="flex gap-3">
          <button
            onClick={() => toggleSave(opportunityId, isSaved)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all',
              isSaved
                ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            )}
          >
            <Heart className={cn('w-4 h-4', isSaved && 'fill-cyan-500 text-cyan-500')} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={() => setShareOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Spots */}
        {spotsAvailable && (
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-500">Spots remaining</span>
              <span className="font-medium text-slate-700">{spotsRemaining} of {spotsAvailable}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <ApplyDrawer
        opportunityId={opportunityId}
        open={applyOpen}
        onOpenChange={setApplyOpen}
      />

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title=""
        opportunityId={opportunityId}
      />
    </>
  );
}
