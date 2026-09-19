'use client';

import { useEffect, useRef } from 'react';
import { X, ArrowUpRight } from 'lucide-react';
import { MatchScoreBadge } from './match-score-badge';
import { MatchScoreBreakdown } from './match-score-breakdown';
import type { MatchDimensions } from '@/lib/ai/types';

interface MatchExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  compositeScore: number;
  dimensions: MatchDimensions | null;
  explanation: string | null;
  isLoading: boolean;
}

export function MatchExplanationModal({
  isOpen,
  onClose,
  compositeScore,
  dimensions,
  explanation,
  isLoading,
}: MatchExplanationModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">Your Match Analysis</h2>
            <MatchScoreBadge score={compositeScore} size="sm" />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          {/* Dimension breakdown */}
          {isLoading && !dimensions ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : dimensions ? (
            <MatchScoreBreakdown dimensions={dimensions} />
          ) : null}

          {/* AI Explanation */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">AI Analysis</h3>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-slate-100 animate-pulse" />
                <div className="h-4 w-3/5 rounded bg-slate-100 animate-pulse" />
              </div>
            ) : explanation ? (
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{explanation}</p>
            ) : (
              <p className="text-sm text-slate-400 italic">Explanation not available yet.</p>
            )}
          </div>

          {/* CTA */}
          <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-medium text-sm rounded-xl px-4 py-3 hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-sm">
            Improve Your Match <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
