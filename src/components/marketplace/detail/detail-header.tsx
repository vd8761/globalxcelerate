import { MapPin, Building2, Clock, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/marketplace/constants';
import { formatDuration } from '@/lib/marketplace/duration-utils';
import type { OpportunityCategory, Organization, DurationUnit, WorkMode } from '@/types/marketplace';

interface DetailHeaderProps {
  title: string;
  organization: Organization;
  publishedAt: string | null;
  location_country: string;
  location_city: string | null;
  work_mode: WorkMode;
  duration_value: number | null;
  duration_unit: DurationUnit | null;
  category: OpportunityCategory;
}

export function DetailHeader({
  title, organization, publishedAt, location_country, location_city,
  work_mode, duration_value, duration_unit, category
}: DetailHeaderProps) {
  const categoryColors = CATEGORY_COLORS[category];
  const workModeLabel = work_mode === 'on_site' ? 'On-site' : work_mode === 'hybrid' ? 'Hybrid' : 'Remote';
  const hashCode = (organization?.name || '').split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
  const hue = Math.abs(hashCode) % 360;

  const daysAgo = publishedAt
    ? Math.floor((Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-4">
      {/* Org info */}
      <div className="flex items-center gap-4">
        {organization?.logo_url ? (
          <img src={organization.logo_url} alt={organization.name} className="w-14 h-14 rounded-xl object-cover border border-slate-100" />
        ) : (
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: `hsl(${hue}, 60%, 50%)` }}>
            {organization?.name?.charAt(0) || '?'}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-slate-700">{organization?.name}</p>
          {daysAgo !== null && (
            <p className="text-xs text-slate-400">
              Posted {daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`}
            </p>
          )}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">{title}</h1>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 text-sm text-slate-600">
          <MapPin className="w-4 h-4 text-slate-400" />
          {[location_city, location_country].filter(Boolean).join(', ')}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-slate-600">
          <Globe className="w-4 h-4 text-slate-400" />
          {workModeLabel}
        </span>
        {duration_value && (
          <span className="flex items-center gap-1.5 text-sm text-slate-600">
            <Clock className="w-4 h-4 text-slate-400" />
            {formatDuration(duration_value, duration_unit)}
          </span>
        )}
        <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', categoryColors.bg, categoryColors.text)}>
          {CATEGORY_LABELS[category]}
        </span>
      </div>
    </div>
  );
}
