'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { careerGoalsSchema } from '@/lib/onboarding/validation-schemas';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { useAutoSave } from '@/hooks/onboarding/useAutoSave';
import { useStepNavigation } from '@/hooks/onboarding/useStepNavigation';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { NavigationFooter } from '@/components/onboarding/NavigationFooter';
import { CareerGoalsForm } from '@/components/onboarding/career-goals/CareerGoalsForm';
import type { CareerGoalsData } from '@/lib/onboarding/types';

export default function CareerGoalsPage() {
  const careerGoals = useOnboardingStore((s) => s.careerGoals);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initializedRef = useRef(false);

  const form = useForm<CareerGoalsData>({
    resolver: zodResolver(careerGoalsSchema),
    defaultValues: careerGoals,
    mode: 'onBlur',
  });

  const formValues = form.watch();
  useAutoSave('career-goals', formValues, true);
  const { goToNext, goBack, skipStep, isNavigating } = useStepNavigation(5);

  useEffect(() => { setCurrentStep(5); }, [setCurrentStep]);
  useEffect(() => {
    if (!initializedRef.current && careerGoals.preferred_industries?.length > 0) {
      initializedRef.current = true;
      form.reset(careerGoals);
    }
  }, [careerGoals, form]);

  const hasAnyValue = formValues.preferred_industries?.length > 0 || formValues.preferred_functions?.length > 0 || !!formValues.work_mode;

  const handleNext = async () => {
    setIsSubmitting(true);
    await goToNext(form.getValues());
    setIsSubmitting(false);
  };

  return (
    <OnboardingShell title="Career Goals" subtitle="Define your ideal career path and preferences">
      <CareerGoalsForm form={form} />
      <NavigationFooter
        onBack={goBack}
        onNext={handleNext}
        onSkip={!hasAnyValue ? skipStep : undefined}
        canSkip={!hasAnyValue}
        isLoading={isSubmitting || isNavigating}
      />
    </OnboardingShell>
  );
}
