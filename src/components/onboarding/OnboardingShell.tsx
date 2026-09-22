'use client';

import { useOnboardingStore } from '@/stores/onboarding-store';
import { ProgressBar } from './ProgressBar';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { useRouter } from 'next/navigation';
import { getStepByNumber } from '@/lib/onboarding/step-config';

interface OnboardingShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function OnboardingShell({ children, title, subtitle }: OnboardingShellProps) {
  const { currentStep, stepStatuses, completionPercentage, saveStatus, lastSavedAt } = useOnboardingStore();
  const router = useRouter();

  const handleStepClick = (stepNum: number) => {
    const step = getStepByNumber(stepNum);
    if (step) {
      router.push(`/student/onboarding/${step.slug}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <ProgressBar
        currentStep={currentStep}
        stepStatuses={stepStatuses}
        completionPercentage={completionPercentage}
        onStepClick={handleStepClick}
      />

      {/* Content card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8 relative">
        {/* Auto-save indicator */}
        <div className="absolute top-4 right-4">
          <AutoSaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
        </div>

        {/* Step header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 font-display">{title}</h1>
          {subtitle && <p className="text-base text-slate-500 mt-1">{subtitle}</p>}
        </div>

        {/* Step content */}
        {children}
      </div>
    </div>
  );
}
