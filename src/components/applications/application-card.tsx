'use client';

import Link from 'next/link';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApplicationListItem } from '@/lib/applications/types';
import { ApplicationStatusBadge } from './application-status-badge';
import { MatchScoreGauge } from './match-score-gauge';
import { formatRelativeDate, truncateText } from '@/lib/applications/utils';

interface Props {
  application: ApplicationListItem;
}

export function ApplicationCard({ application }: Props) {
  const { opportunity, status, match_score, submitted_at, created_at } = application;
  const isSelected = status === 'selected';
  const isDraft = status === 'draft';

  const draftAge = isDraft
    ? (Date.now() - new Date(created_at).getTime()) / (1000 * 60 * 60 * 24)
    : 0;
  const isExpiringSoon = isDraft && draftAge > 90;

  return (
    <Link href={`/applications/${application.id}`} className="block group">
      <div
        className={cn(
          'relative bg-white rounded-2xl border border-gray-200 shadow-sm p-5 transition-all duration-200',
          'hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
          isSelected && 'border-l-4 border-l-emerald-400'
        )}
      >
        {isExpiringSoon && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              <AlertTriangle className="w-3 h-3" />
              Expiring soon
            </span>
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
            {opportunity.organization.logo_url ? (
              <img
                src={opportunity.organization.logo_url}
                alt={opportunity.organization.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-slate-500">
                {opportunity.organization.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 leading-tight mb-0.5 group-hover:text-cyan-700 transition-colors">
              {truncateText(opportunity.title, 60)}
            </h3>
            <p className="text-xs text-slate-500 truncate">{opportunity.organization.name}</p>
          </div>

          <MatchScoreGauge score={match_score} size="sm" />
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <ApplicationStatusBadge status={status} size="sm" />
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">
              {isDraft ? 'Draft \u2014 not submitted' : submitted_at ? formatRelativeDate(submitted_at) : formatRelativeDate(created_at)}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-cyan-600 transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}
