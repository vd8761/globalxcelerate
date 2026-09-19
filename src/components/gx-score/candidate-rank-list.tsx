'use client';

import { MatchScoreBadge } from './match-score-badge';
import { CandidateMatchCard } from './candidate-match-card';
import type { CandidateRank } from '@/lib/ai/types';
import { Users } from 'lucide-react';

interface CandidateRankListProps {
  candidates: CandidateRank[];
  totalCount: number;
  page: number;
  perPage: number;
}

export function CandidateRankList({ candidates, totalCount, page, perPage }: CandidateRankListProps) {
  if (candidates.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-700">No Candidates Yet</h3>
        <p className="text-sm text-slate-500 mt-1">Candidates will appear here once students apply or match scores are calculated.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, totalCount)} of {totalCount} candidates
        </p>
      </div>

      {/* Table view for desktop */}
      <div className="hidden md:block rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3 w-12">#</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Student</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Score</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Top Skills</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Gaps</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.map((candidate, idx) => (
              <tr key={candidate.student_id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-slate-500">
                  {(page - 1) * perPage + idx + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                      {candidate.student_name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-900">{candidate.student_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <MatchScoreBadge score={candidate.composite_score} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {candidate.top_skills.slice(0, 3).map(skill => (
                      <span key={skill} className="text-xs bg-cyan-50 text-cyan-700 rounded-full px-2 py-0.5">
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm text-slate-600">{candidate.skill_gaps_count}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card view for mobile */}
      <div className="md:hidden space-y-3">
        {candidates.map((candidate, idx) => (
          <CandidateMatchCard
            key={candidate.student_id}
            candidate={candidate}
            rank={(page - 1) * perPage + idx + 1}
          />
        ))}
      </div>
    </div>
  );
}
