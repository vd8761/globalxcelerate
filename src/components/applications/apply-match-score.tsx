'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { MatchScoreGauge } from './match-score-gauge';

interface Props {
  opportunityId: string;
}

export function ApplyMatchScore({ opportunityId }: Props) {
  const { data, isLoading, isError } = useQuery<{ total_score: number; dimension_scores: Record<string, number> }>({
    queryKey: ['match-score-preview', opportunityId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/opportunities/${opportunityId}/match`);
      if (!res.ok) throw new Error('Failed to fetch match score');
      const json = await res.json();
      return json.data ?? json;
    },
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-3">
        <p className="text-xs text-slate-400">Match score unavailable</p>
      </div>
    );
  }

  const topDimensions = Object.entries(data.dimension_scores ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const level = data.total_score >= 75 ? 'Strong' : data.total_score >= 50 ? 'Moderate' : 'Low';

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-800">Match Score</h4>
      <div className="flex items-center gap-4">
        <MatchScoreGauge score={data.total_score} size="md" />
        <div>
          <p className="text-sm font-medium text-slate-800">{level} match</p>
          <p className="text-xs text-slate-500">{Math.round(data.total_score)}% compatibility</p>
        </div>
      </div>
      {topDimensions.length > 0 && (
        <div className="space-y-1.5 mt-2">
          {topDimensions.map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 w-16 capitalize truncate">{key.replace(/_/g, ' ')}</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-slate-700 to-cyan-500"
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-slate-600 w-7 text-right">{value}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
