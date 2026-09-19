'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';

interface EligibilityCheck {
  name: string;
  passed: boolean;
  message: string;
}

interface EligibilityResult {
  isEligible: boolean;
  checks: EligibilityCheck[];
}

export function useEligibilityCheck(opportunityId: string) {
  const { user } = useAuth();

  return useQuery<EligibilityResult>({
    queryKey: ['eligibility', opportunityId, user?.id],
    queryFn: async () => {
      const checks: EligibilityCheck[] = [];

      // Check deadline and existing applications via the opportunity detail + applications list
      const [oppRes, appRes] = await Promise.all([
        fetch(`/api/v1/opportunities/${opportunityId}`),
        fetch(`/api/v1/applications?opportunity_id=${opportunityId}&per_page=1`),
      ]);

      if (!oppRes.ok) {
        return { isEligible: false, checks: [{ name: 'Opportunity access', passed: false, message: 'Could not verify opportunity' }] };
      }

      const oppJson = await oppRes.json();
      const opportunity = oppJson.data || oppJson;

      // Check deadline
      const deadline = opportunity.deadline ? new Date(opportunity.deadline) : null;
      const deadlinePassed = deadline ? deadline < new Date() : false;
      checks.push({
        name: 'Deadline',
        passed: !deadlinePassed,
        message: deadlinePassed ? 'Application deadline has passed' : 'Deadline has not passed',
      });

      // Check already applied
      const appJson = await appRes.json();
      const alreadyApplied = (appJson.data?.length ?? 0) > 0;
      checks.push({
        name: 'Not applied',
        passed: !alreadyApplied,
        message: alreadyApplied ? 'You have already applied to this opportunity' : 'You haven\'t applied yet',
      });

      // Check max applications
      const maxApps = opportunity.max_applications;
      const currentApps = opportunity.current_applications ?? 0;
      const maxReached = maxApps ? currentApps >= maxApps : false;
      checks.push({
        name: 'Accepting applications',
        passed: !maxReached,
        message: maxReached ? 'This opportunity has reached maximum applications' : 'Still accepting applications',
      });

      const isEligible = checks.every((c) => c.passed);
      return { isEligible, checks };
    },
    enabled: !!opportunityId && !!user?.id,
    staleTime: 60000,
  });
}
