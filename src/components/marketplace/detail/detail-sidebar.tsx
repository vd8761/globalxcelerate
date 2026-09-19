'use client';

import { DetailActionCard } from './detail-action-card';
import { DetailDeadlineCard } from './detail-deadline-card';
import { MatchScoreCard } from './match-score-card';
import { OrganizationCard } from './organization-card';
import type { Organization, OpportunitySkill } from '@/types/marketplace';

interface DetailSidebarProps {
  opportunityId: string;
  opportunity: {
    application_deadline: string | null;
    spots_available: number | null;
    spots_filled: number;
    compensation_type: string | null;
    compensation_min: number | null;
    compensation_max: number | null;
    compensation_currency: string | null;
    compensation_period: string | null;
  };
  organization: Organization;
  isExpired: boolean;
  skills: OpportunitySkill[];
}

export function DetailSidebar({ opportunityId, opportunity, organization, isExpired, skills }: DetailSidebarProps) {
  return (
    <div className="space-y-4">
      <DetailActionCard
        opportunityId={opportunityId}
        isExpired={isExpired}
        spotsAvailable={opportunity.spots_available}
        spotsFilled={opportunity.spots_filled}
      />

      <DetailDeadlineCard deadline={opportunity.application_deadline} />

      <MatchScoreCard opportunityId={opportunityId} />

      <OrganizationCard organization={organization} />
    </div>
  );
}
