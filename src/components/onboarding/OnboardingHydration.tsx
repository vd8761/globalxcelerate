'use client';

import { useOnboardingProgress } from '@/hooks/onboarding/useOnboardingProgress';

export function OnboardingHydration() {
  useOnboardingProgress();
  return null;
}
