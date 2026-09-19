'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { getStepByNumber, getNextStep, getPrevStep } from '@/lib/onboarding/step-config';
import { OPTIONAL_STEPS } from '@/lib/onboarding/constants';

export function useStepNavigation(currentStepNumber: number) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const { setCurrentStep, setStepStatus } = useOnboardingStore();

  const goToNext = useCallback(async (data?: unknown) => {
    setIsNavigating(true);
    try {
      if (data) {
        const currentStep = getStepByNumber(currentStepNumber);
        const res = await fetch('/api/v1/students/onboarding', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step: currentStep?.slug, data, action: 'next' }),
        });
        if (!res.ok) {
          const err = await res.json();
          setIsNavigating(false);
          return { success: false, error: err };
        }
        const result = await res.json();
        if (result.data?.completion_percentage != null) {
          useOnboardingStore.getState().setCompletionPercentage(result.data.completion_percentage);
        }
      }

      const currentSlug = getStepByNumber(currentStepNumber)?.slug;
      if (currentSlug) setStepStatus(currentSlug, 'completed');

      const next = getNextStep(currentStepNumber);
      if (next) {
        setCurrentStep(next.number);
        setStepStatus(next.slug, 'active');
        router.push(`/student/onboarding/${next.slug}`);
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Navigation failed' };
    } finally {
      setIsNavigating(false);
    }
  }, [currentStepNumber, router, setCurrentStep, setStepStatus]);

  const goBack = useCallback(() => {
    const prev = getPrevStep(currentStepNumber);
    if (prev) {
      setCurrentStep(prev.number);
      router.push(`/student/onboarding/${prev.slug}`);
    }
  }, [currentStepNumber, router, setCurrentStep]);

  const skipStep = useCallback(async () => {
    const currentStep = getStepByNumber(currentStepNumber);
    if (!currentStep || !OPTIONAL_STEPS.includes(currentStepNumber)) return;

    setIsNavigating(true);
    try {
      await fetch('/api/v1/students/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: currentStep.slug, data: null, action: 'skip' }),
      });

      setStepStatus(currentStep.slug, 'skipped');
      const next = getNextStep(currentStepNumber);
      if (next) {
        setCurrentStep(next.number);
        setStepStatus(next.slug, 'active');
        router.push(`/student/onboarding/${next.slug}`);
      }
    } finally {
      setIsNavigating(false);
    }
  }, [currentStepNumber, router, setCurrentStep, setStepStatus]);

  const goToStep = useCallback((stepNum: number) => {
    const step = getStepByNumber(stepNum);
    if (step) {
      setCurrentStep(stepNum);
      router.push(`/student/onboarding/${step.slug}`);
    }
  }, [router, setCurrentStep]);

  return { goToNext, goBack, skipStep, goToStep, isNavigating };
}
