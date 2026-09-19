'use client';

import { useEffect, useState } from 'react';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { useAutoSave } from '@/hooks/onboarding/useAutoSave';
import { useStepNavigation } from '@/hooks/onboarding/useStepNavigation';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { NavigationFooter } from '@/components/onboarding/NavigationFooter';
import { PortfolioSections } from '@/components/onboarding/portfolio/PortfolioSections';
import type { PortfolioItem, ExternalLinkEntry } from '@/lib/onboarding/types';

export default function PortfolioPage() {
  const portfolio = useOnboardingStore((s) => s.portfolio);
  const setStepData = useOnboardingStore((s) => s.setStepData);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const [items, setItems] = useState<PortfolioItem[]>(portfolio.items);
  const [links, setLinks] = useState<ExternalLinkEntry[]>(portfolio.external_links);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { setCurrentStep(7); }, [setCurrentStep]);
  useEffect(() => {
    if (portfolio.items.length > 0) setItems(portfolio.items);
    if (portfolio.external_links.length > 0) setLinks(portfolio.external_links);
  }, [portfolio]);

  const formData = { items, external_links: links };
  useAutoSave('portfolio', formData, items.length > 0 || links.length > 0);

  useEffect(() => {
    setStepData('portfolio', { items, external_links: links });
  }, [items, links, setStepData]);

  const { goToNext, goBack, skipStep, isNavigating } = useStepNavigation(7);

  const hasContent = items.length > 0 || links.length > 0;

  const handleNext = async () => {
    setIsSubmitting(true);
    await goToNext({ items, external_links: links });
    setIsSubmitting(false);
  };

  return (
    <OnboardingShell title="Portfolio" subtitle="Showcase your work, publications, and achievements">
      <PortfolioSections
        items={items}
        externalLinks={links}
        onUpdateItems={setItems}
        onUpdateLinks={setLinks}
      />
      <NavigationFooter
        onBack={goBack}
        onNext={handleNext}
        onSkip={!hasContent ? skipStep : undefined}
        canSkip={!hasContent}
        isLoading={isSubmitting || isNavigating}
        nextLabel="Review Profile"
      />
    </OnboardingShell>
  );
}
