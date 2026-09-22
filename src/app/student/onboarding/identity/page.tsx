'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { identitySchema } from '@/lib/onboarding/validation-schemas';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { useAutoSave } from '@/hooks/onboarding/useAutoSave';
import { useStepNavigation } from '@/hooks/onboarding/useStepNavigation';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { NavigationFooter } from '@/components/onboarding/NavigationFooter';
import { IdentityForm } from '@/components/onboarding/identity/IdentityForm';
import type { IdentityData } from '@/lib/onboarding/types';

export default function IdentityPage() {
  const identity = useOnboardingStore((s) => s.identity);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initializedRef = useRef(false);

  const form = useForm<IdentityData>({
    resolver: zodResolver(identitySchema),
    defaultValues: identity,
    mode: 'onBlur',
  });

  const formValues = form.watch();
  useAutoSave('identity', formValues, true);
  const { goToNext, isNavigating } = useStepNavigation(1);

  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  useEffect(() => {
    if (!initializedRef.current && identity.first_name) {
      initializedRef.current = true;
      form.reset({
        ...identity,
        date_of_birth: identity.date_of_birth?.substring(0, 10) || '',
      });
    }
  }, [identity, form]);

  const handleNext = async () => {
    const valid = await form.trigger();
    if (!valid) return;
    setIsSubmitting(true);
    await goToNext(form.getValues());
    setIsSubmitting(false);
  };

  return (
    <OnboardingShell title="Identity" subtitle="Tell us about yourself">
      <IdentityForm form={form} />
      <NavigationFooter
        isFirstStep
        onNext={handleNext}
        isLoading={isSubmitting || isNavigating}
        isNextDisabled={isSubmitting}
      />
    </OnboardingShell>
  );
}
