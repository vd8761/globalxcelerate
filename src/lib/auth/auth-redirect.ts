import { ROLE_DASHBOARDS, ROLE_ONBOARDING } from './constants';
import type { UserRole } from '@/types/auth';
import type { User } from '@supabase/supabase-js';

export function getPostAuthRedirect(user: User | null): string {
  if (!user) return '/login';

  const role = user.user_metadata?.role as UserRole | undefined;

  // No role selected yet
  if (!role) return '/role-select';

  // Check onboarding status
  const onboardingCompleted = user.user_metadata?.onboarding_completed as boolean | undefined;

  if (!onboardingCompleted) {
    return ROLE_ONBOARDING[role] || '/role-select';
  }

  return ROLE_DASHBOARDS[role] || '/role-select';
}

export const ROLE_REDIRECT_MAP = ROLE_DASHBOARDS;
