'use client';

import { MatchScoreBadge } from './match-score-badge';
import type { CandidateRank } from '@/lib/ai/types';

interface CandidateMatchCardProps {
  candidate: CandidateRank;
  rank: number;
}

export function CandidateMatchCard({ candidate, rank }: CandidateMatchCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
              {candidate.student_name.charAt(0)}
            </div>
            <span className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-slate-800 text-white text-[10px] flex items-center justify-center font-bold">
              {rank}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">{candidate.student_name}</h4>
            <p className="text-xs text-slate-500">{candidate.skill_gaps_count} skill gaps</p>
          </div>
        </div>
        <MatchScoreBadge score={candidate.composite_score} size="md" />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {candidate.top_skills.slice(0, 3).map(skill => (
          <span key={skill} className="text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-full px-2 py-0.5">
            {skill}
          </span>
        ))}
      </div>

      <button className="mt-3 w-full text-xs text-cyan-600 hover:text-cyan-700 font-medium text-center py-1.5 rounded-lg hover:bg-cyan-50 transition-colors">
        View Profile
      </button>
    </div>
  );
}
