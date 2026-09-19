'use client';

import { useQuery } from '@tanstack/react-query';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { useEffect } from 'react';

async function fetchProgress() {
  const res = await fetch('/api/v1/students/onboarding/progress');
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch onboarding progress');
  }
  return res.json();
}

export function useOnboardingProgress() {
  const hydrateFromServer = useOnboardingStore((s) => s.hydrateFromServer);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const setCompletionPercentage = useOnboardingStore((s) => s.setCompletionPercentage);

  const query = useQuery({
    queryKey: ['onboarding', 'progress'],
    queryFn: fetchProgress,
    staleTime: 0,
    retry: 2,
  });

  useEffect(() => {
    if (query.data?.data) {
      const progress = query.data.data;
      setCurrentStep(progress.current_step);
      setCompletionPercentage(progress.completion_percentage);
      if (progress.step_statuses) {
        hydrateFromServer(progress, progress.step_data ?? {});
      }
    }
  }, [query.data, hydrateFromServer, setCurrentStep, setCompletionPercentage]);

  return {
    progress: query.data?.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
