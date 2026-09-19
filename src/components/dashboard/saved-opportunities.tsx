import Link from 'next/link';
import { Heart, MapPin, Bookmark } from 'lucide-react';
import type { SavedOpportunityItem } from '@/types/dashboard';
import { MAX_SAVED } from '@/lib/dashboard/constants';

interface SavedOpportunitiesProps {
  savedOpportunities: SavedOpportunityItem[];
}

const CATEGORY_COLORS: Record<string, string> = {
  internship: 'bg-blue-50 text-blue-700',
  immersion: 'bg-purple-50 text-purple-700',
  exchange: 'bg-cyan-50 text-cyan-700',
  project: 'bg-green-50 text-green-700',
  research: 'bg-amber-50 text-amber-700',
  scholarship: 'bg-pink-50 text-pink-700',
  career: 'bg-indigo-50 text-indigo-700',
};

export function SavedOpportunities({ savedOpportunities }: SavedOpportunitiesProps) {
  const display = savedOpportunities.slice(0, MAX_SAVED);

  return (
    <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-slate-700" />
          Saved Opportunities
        </h2>
        <Link href="/student/marketplace?tab=saved" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
          View All →
        </Link>
      </div>

      {display.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Heart className="w-10 h-10 text-gray-200 mb-2" />
          <p className="text-sm text-gray-500 mb-3">No saved opportunities yet</p>
          <Link
            href="/student/marketplace"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Browse Opportunities →
          </Link>
        </div>
      ) : (
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:overflow-visible">
          {display.map((item) => {
            const catColor = CATEGORY_COLORS[item.category?.toLowerCase()] || 'bg-gray-100 text-gray-600';
            return (
              <Link
                key={item.id}
                href={`/marketplace/${item.id}`}
                className="min-w-[200px] p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors snap-start flex-shrink-0"
              >
                <p className="text-sm font-medium text-slate-800 line-clamp-1">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{item.organization_name}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {item.country && (
                    <span className="inline-flex items-center gap-0.5 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {item.country}
                    </span>
                  )}
                  {item.category && (
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${catColor}`}>
                      {item.category}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
