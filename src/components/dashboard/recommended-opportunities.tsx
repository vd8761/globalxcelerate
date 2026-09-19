'use client';

import Link from 'next/link';
import { MapPin, Clock, Sparkles } from 'lucide-react';
import type { OpportunityRecommendation } from '@/types/dashboard';
import { MAX_RECOMMENDATIONS } from '@/lib/dashboard/constants';

interface RecommendedOpportunitiesProps {
  recommendations: OpportunityRecommendation[];
}

function getMatchColor(percentage: number) {
  if (percentage >= 80) return 'bg-green-50 text-green-700';
  if (percentage >= 60) return 'bg-blue-50 text-blue-700';
  return 'bg-gray-100 text-gray-600';
}

export function RecommendedOpportunities({ recommendations }: RecommendedOpportunitiesProps) {
  const display = recommendations.slice(0, MAX_RECOMMENDATIONS);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-500" />
          Recommended For You
        </h2>
        <Link href="/student/marketplace" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
          View All →
        </Link>
      </div>

      {display.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-3">
            <Sparkles className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-sm text-gray-500 max-w-xs">
            Complete your profile to get personalized recommendations
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {display.map((rec) => (
            <Link
              key={rec.id}
              href={`/marketplace/${rec.id}`}
              className="p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors border border-gray-100 group"
            >
              <p className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-blue-700 transition-colors">
                {rec.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{rec.organization_name}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {rec.country && (
                  <span className="inline-flex items-center gap-0.5 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    {rec.country}
                  </span>
                )}
                {rec.duration && (
                  <span className="inline-flex items-center gap-0.5 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {rec.duration}
                  </span>
                )}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getMatchColor(rec.match_percentage)}`}>
                  {rec.match_percentage}% match
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
