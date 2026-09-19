'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { globalPreferencesSchema } from '@/lib/onboarding/validation-schemas';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { useAutoSave } from '@/hooks/onboarding/useAutoSave';
import { useStepNavigation } from '@/hooks/onboarding/useStepNavigation';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { NavigationFooter } from '@/components/onboarding/NavigationFooter';
import { GlobalPreferencesForm } from '@/components/onboarding/global-preferences/GlobalPreferencesForm';
import type { GlobalPreferencesData } from '@/lib/onboarding/types';

export default function GlobalPreferencesPage() {
  const globalPreferences = useOnboardingStore((s) => s.globalPreferences);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initializedRef = useRef(false);

  const form = useForm<GlobalPreferencesData>({
    resolver: zodResolver(globalPreferencesSchema),
    defaultValues: globalPreferences,
    mode: 'onBlur',
  });

  const formValues = form.watch();
  useAutoSave('global-preferences', formValues, true);
  const { goToNext, goBack, skipStep, isNavigating } = useStepNavigation(6);

  useEffect(() => { setCurrentStep(6); }, [setCurrentStep]);
  useEffect(() => {
    if (!initializedRef.current && globalPreferences.languages?.length > 0) {
      initializedRef.current = true;
      form.reset(globalPreferences);
    }
  }, [globalPreferences, form]);

  const hasAnyValue = (formValues.languages?.length ?? 0) > 0 || (formValues.preferred_program_types?.length ?? 0) > 0 || !!formValues.relocation_willingness;

  const handleNext = async () => {
    setIsSubmitting(true);
    await goToNext(form.getValues());
    setIsSubmitting(false);
  };

  return (
    <OnboardingShell title="Global Preferences" subtitle="Share your global readiness and mobility preferences">
      <GlobalPreferencesForm form={form} />
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
