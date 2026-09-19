'use client';

import { MapPin, Clock, Calendar, Heart } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { OpportunityListItem } from '@/types/marketplace';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/marketplace/constants';
import { formatDuration } from '@/lib/marketplace/duration-utils';
import { formatDeadline, getDeadlineUrgency, isExpired } from '@/lib/marketplace/deadline-utils';
import { getMatchColorClasses, getMatchGrade } from '@/lib/marketplace/match-score-utils';
import { useSaveOpportunity } from '@/hooks/marketplace/use-save-opportunity';
import { useSavedOpportunitiesStore } from '@/stores/marketplace/saved-opportunities-store';

interface OpportunityCardProps {
  opportunity: OpportunityListItem;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const { toggleSave } = useSaveOpportunity();
  const isSavedInStore = useSavedOpportunitiesStore((s) => s.savedIds.has(opportunity.id));
  const isSaved = isSavedInStore || opportunity.is_saved;
  const expired = isExpired(opportunity.application_deadline);
  const urgency = getDeadlineUrgency(opportunity.application_deadline);

  const categoryColors = CATEGORY_COLORS[opportunity.category];
  const workModeLabel = opportunity.work_mode === 'on_site' ? 'On-site' : opportunity.work_mode === 'hybrid' ? 'Hybrid' : 'Remote';

  // Logo fallback
  const orgInitial = opportunity.organization?.name?.charAt(0) || '?';
  const hashCode = (opportunity.organization?.name || '').split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
  const hue = Math.abs(hashCode) % 360;

  return (
    <Link
      href={`/marketplace/${opportunity.id}`}
      className={cn(
        'group relative flex flex-col bg-white border border-slate-200 rounded-2xl p-5 min-h-[280px] transition-all duration-200',
        expired ? 'opacity-60' : 'hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300'
      )}
    >
      {/* Save button */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSave(opportunity.id, isSaved); }}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-all z-10"
        aria-label={isSaved ? 'Unsave opportunity' : 'Save opportunity'}
      >
        <Heart
          className={cn(
            'w-5 h-5 transition-all',
            isSaved ? 'fill-cyan-500 text-cyan-500 scale-110' : 'text-slate-400 group-hover:text-slate-600'
          )}
        />
      </button>

      {/* Featured badge */}
      {opportunity.featured && (
        <span className="absolute top-4 left-4 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold uppercase rounded-full">
          Featured
        </span>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {opportunity.organization?.logo_url ? (
          <img
            src={opportunity.organization.logo_url}
            alt={opportunity.organization.name}
            className="w-10 h-10 rounded-lg object-cover border border-slate-100"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: `hsl(${hue}, 60%, 50%)` }}
          >
            {orgInitial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500 truncate">{opportunity.organization?.name}</p>
          <h3 className="text-base font-semibold text-slate-900 line-clamp-2 leading-snug mt-0.5">
            {opportunity.title}
          </h3>
        </div>
      </div>

      {/* Location + Work mode */}
      <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {[opportunity.location_city, opportunity.location_country].filter(Boolean).join(', ')}
        </span>
        <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-medium">
          {workModeLabel}
        </span>
      </div>

      {/* Category badge */}
      <div className="mb-3">
        <span className={cn('inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium', categoryColors.bg, categoryColors.text)}>
          {CATEGORY_LABELS[opportunity.category]}
        </span>
      </div>

      {/* Duration + Start date */}
      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
        {opportunity.duration_value && (
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(opportunity.duration_value, opportunity.duration_unit)}
          </span>
        )}
        {opportunity.start_date && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Starts {new Date(opportunity.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
        )}
      </div>

      {/* Skills */}
      {opportunity.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {opportunity.skills.slice(0, 3).map((skill) => (
            <span key={skill.id} className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-full text-[10px] font-medium border border-slate-100">
              {skill.name}
            </span>
          ))}
          {opportunity.skills.length > 3 && (
            <span className="px-2 py-0.5 text-slate-400 text-[10px]">
              +{opportunity.skills.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-100">
        <span className={cn(
          'text-xs font-medium',
          urgency === 'critical' ? 'text-red-600' : urgency === 'warning' ? 'text-amber-600' : 'text-slate-500'
        )}>
          {formatDeadline(opportunity.application_deadline)}
        </span>

        {opportunity.match_score !== null && (
          <div className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white',
            getMatchColorClasses(opportunity.match_score)
          )}>
            {Math.round(opportunity.match_score)}%
          </div>
        )}
      </div>

      {/* Expired overlay */}
      {expired && (
        <div className="absolute inset-0 rounded-2xl bg-white/60 flex items-center justify-center">
          <span className="px-3 py-1 bg-slate-800 text-white text-xs font-medium rounded-full">Expired</span>
        </div>
      )}
    </Link>
  );
}
