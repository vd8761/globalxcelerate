'use client';

import { useEffect, useState } from 'react';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { useAutoSave } from '@/hooks/onboarding/useAutoSave';
import { useStepNavigation } from '@/hooks/onboarding/useStepNavigation';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { NavigationFooter } from '@/components/onboarding/NavigationFooter';
import { ExperienceTypeSelector } from '@/components/onboarding/experience/ExperienceTypeSelector';
import { ExperienceList } from '@/components/onboarding/experience/ExperienceList';
import type { ExperienceEntry, ExperienceTypeEnum } from '@/lib/onboarding/types';

export default function ExperiencePage() {
  const experience = useOnboardingStore((s) => s.experience);
  const setStepData = useOnboardingStore((s) => s.setStepData);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const [entries, setEntries] = useState<ExperienceEntry[]>(experience.entries);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { setCurrentStep(4); }, [setCurrentStep]);
  useEffect(() => {
    if (experience.entries.length > 0 && entries.length === 0) setEntries(experience.entries);
  }, [experience.entries]);

  const formData = { entries };
  useAutoSave('experience', formData, entries.length > 0);

  useEffect(() => {
    setStepData('experience', { entries });
  }, [entries, setStepData]);

  const { goToNext, goBack, skipStep, isNavigating } = useStepNavigation(4);

  const handleAddEntry = (type: ExperienceTypeEnum) => {
    const newEntry: ExperienceEntry = {
      id: crypto.randomUUID(),
      type,
      title: '',
      organization_name: '',
      description: '',
      location: '',
      start_date: '',
      end_date: null,
      is_current: false,
      skills_used: [],
      outcomes: [],
      url: '',
      display_order: entries.length,
    };
    setEntries([...entries, newEntry]);
  };

  const handleNext = async () => {
    setIsSubmitting(true);
    await goToNext({ entries });
    setIsSubmitting(false);
  };

  return (
    <OnboardingShell title="Experience" subtitle="Share your professional and extracurricular experiences">
      <div className="space-y-6">
        <ExperienceTypeSelector onSelectType={handleAddEntry} />
        <ExperienceList
          entries={entries}
          onUpdate={setEntries}
          onDelete={(id) => setEntries(entries.filter((e) => e.id !== id))}
        />
      </div>

      <NavigationFooter
        onBack={goBack}
        onNext={handleNext}
        onSkip={entries.length === 0 ? skipStep : undefined}
        canSkip={entries.length === 0}
        isLoading={isSubmitting || isNavigating}
      />
    </OnboardingShell>
  );
}
