import Link from 'next/link';
import { MapPin, Globe } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/marketplace/constants';
import { cn } from '@/lib/utils';
import type { RelatedOpportunity } from '@/types/marketplace';

interface RelatedOpportunitiesProps {
  opportunities: RelatedOpportunity[];
}

export function RelatedOpportunities({ opportunities }: RelatedOpportunitiesProps) {
  if (!opportunities || opportunities.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Similar Opportunities</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {opportunities.map((opp) => {
          const colors = CATEGORY_COLORS[opp.category];
          return (
            <Link
              key={opp.id}
              href={`/marketplace/${opp.id}`}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                {(opp.organization as any)?.logo_url ? (
                  <img src={(opp.organization as any).logo_url} className="w-8 h-8 rounded-lg object-cover" alt="" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-slate-200" />
                )}
                <span className="text-xs text-slate-500 truncate">{(opp.organization as any)?.name}</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-2">{opp.title}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="w-3 h-3" />
                {opp.location_country}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
