'use client';

import { useMemo } from 'react';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { calculateStepCompletion, calculateOverallCompletion } from '@/lib/onboarding/completion';
import { STEP_NAMES } from '@/lib/onboarding/constants';

export function useCompletionPercentage() {
  const identity = useOnboardingStore((s) => s.identity);
  const education = useOnboardingStore((s) => s.education);
  const skills = useOnboardingStore((s) => s.skills);
  const experience = useOnboardingStore((s) => s.experience);
  const careerGoals = useOnboardingStore((s) => s.careerGoals);
  const globalPreferences = useOnboardingStore((s) => s.globalPreferences);
  const portfolio = useOnboardingStore((s) => s.portfolio);

  const allData: Record<string, unknown> = useMemo(() => ({
    identity,
    education,
    skills,
    experience,
    'career-goals': careerGoals,
    'global-preferences': globalPreferences,
    portfolio,
  }), [identity, education, skills, experience, careerGoals, globalPreferences, portfolio]);

  const perStep = useMemo(() => {
    const result: Record<string, number> = {};
    for (const name of STEP_NAMES) {
      if (name === 'complete') continue;
      result[name] = Math.round(calculateStepCompletion(name, allData[name]) * 100);
    }
    return result;
  }, [allData]);

  const overall = useMemo(() => calculateOverallCompletion(allData), [allData]);

  return { overall, perStep };
}
