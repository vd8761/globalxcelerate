'use client';

import { useEffect, useState, useCallback } from 'react';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { useAutoSave } from '@/hooks/onboarding/useAutoSave';
import { useStepNavigation } from '@/hooks/onboarding/useStepNavigation';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { NavigationFooter } from '@/components/onboarding/NavigationFooter';
import { EducationList } from '@/components/onboarding/education/EducationList';
import type { EducationEntry } from '@/lib/onboarding/types';

export default function EducationPage() {
  const education = useOnboardingStore((s) => s.education);
  const setStepData = useOnboardingStore((s) => s.setStepData);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const [entries, setEntries] = useState<EducationEntry[]>(education.entries);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { setCurrentStep(2); }, [setCurrentStep]);
  useEffect(() => {
    if (education.entries.length > 0) setEntries(education.entries);
  }, [education.entries]);

  const formData = { entries };
  useAutoSave('education', formData, entries.length > 0);

  useEffect(() => {
    setStepData('education', { entries });
  }, [entries, setStepData]);

  const { goToNext, goBack, isNavigating } = useStepNavigation(2);

  const handleNext = async () => {
    const validEntries = entries.filter((e) => e.institution_name && e.degree_level && e.field_of_study && e.start_date);
    if (validEntries.length === 0) return;
    setIsSubmitting(true);
    await goToNext({ entries });
    setIsSubmitting(false);
  };

  const hasValidEntry = entries.some((e) => e.institution_name && e.degree_level && e.field_of_study && e.start_date);

  return (
    <OnboardingShell title="Education" subtitle="Add your educational background">
      <EducationList entries={entries} onUpdate={setEntries} />
      <NavigationFooter
        onBack={goBack}
        onNext={handleNext}
        isLoading={isSubmitting || isNavigating}
        isNextDisabled={!hasValidEntry}
      />
    </OnboardingShell>
  );
}
