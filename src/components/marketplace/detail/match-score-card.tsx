'use client';

import { useMatchScore } from '@/hooks/marketplace/use-match-score';
import { useAuth } from '@/hooks/use-auth';
import { getMatchGrade, getMatchLabel, getMatchColorClasses } from '@/lib/marketplace/match-score-utils';
import { cn } from '@/lib/utils';
import { Sparkles, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface MatchScoreCardProps {
  opportunityId: string;
}

export function MatchScoreCard({ opportunityId }: MatchScoreCardProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading } = useMatchScore(opportunityId, !!user);
  const [expanded, setExpanded] = useState(false);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="text-center">
          <Sparkles className="w-6 h-6 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 mb-3">Sign in to see your match score</p>
          <Link
            href="/login"
            className="text-xs font-medium text-cyan-600 hover:text-cyan-700"
          >
            Sign In →
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
        <div className="flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-slate-200" />
        </div>
        <div className="h-4 bg-slate-100 rounded w-24 mx-auto mt-3" />
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="text-center">
          <Sparkles className="w-6 h-6 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Complete your profile for match scoring</p>
          <Link href="/student/onboarding" className="text-xs font-medium text-cyan-600 hover:text-cyan-700 mt-1 inline-block">
            Complete Profile →
          </Link>
        </div>
      </div>
    );
  }

  const { overall_score, grade, dimensions, explanation, strengths, gaps } = data.data;
  const matchGrade = getMatchGrade(overall_score);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      {/* Score circle */}
      <div className="flex flex-col items-center mb-4">
        <div className={cn(
          'w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl',
          getMatchColorClasses(overall_score)
        )}>
          {Math.round(overall_score)}%
        </div>
        <span className="mt-2 text-sm font-semibold text-slate-700">{getMatchLabel(matchGrade)}</span>
      </div>

      {/* Dimensions */}
      <div className="space-y-2.5 mb-4">
        {(dimensions || []).map((dim: any) => (
          <div key={dim.name}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600">{dim.name}</span>
              <span className="font-medium text-slate-700">{dim.score}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all"
                style={{ width: `${dim.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Expandable explanation */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', expanded && 'rotate-180')} />
        Why this score?
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 text-xs">
          {strengths?.length > 0 && (
            <div>
              <p className="font-medium text-emerald-700 mb-1">Strengths</p>
              <ul className="space-y-1">
                {strengths.map((s: string, i: number) => (
                  <li key={i} className="text-slate-600 flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {gaps?.length > 0 && (
            <div>
              <p className="font-medium text-amber-700 mb-1">Areas to Improve</p>
              <ul className="space-y-1">
                {gaps.map((g: string, i: number) => (
                  <li key={i} className="text-slate-600 flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
