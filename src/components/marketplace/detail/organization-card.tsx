import { Building2, Globe, MapPin, Users, ExternalLink } from 'lucide-react';
import type { Organization } from '@/types/marketplace';

interface OrganizationCardProps {
  organization: Organization;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  if (!organization) return null;

  const hashCode = (organization.name || '').split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
  const hue = Math.abs(hashCode) % 360;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-3">
        {organization.logo_url ? (
          <img src={organization.logo_url} alt={organization.name} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
        ) : (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: `hsl(${hue}, 60%, 50%)` }}>
            {organization.name?.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 truncate">{organization.name}</h4>
          {organization.industry && (
            <p className="text-xs text-slate-500">{organization.industry}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 text-xs text-slate-600">
        {organization.location_country && (
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {[organization.location_city, organization.location_country].filter(Boolean).join(', ')}
          </div>
        )}
        {organization.size && (
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            {organization.size} employees
          </div>
        )}
      </div>

      {organization.description && (
        <p className="text-xs text-slate-500 mt-3 line-clamp-3">{organization.description}</p>
      )}

      <a
        href={`/marketplace?country=${organization.location_country}`}
        className="flex items-center gap-1 mt-3 text-xs font-medium text-cyan-600 hover:text-cyan-700 transition-colors"
      >
        View all opportunities
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
