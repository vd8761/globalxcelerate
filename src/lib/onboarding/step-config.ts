import type { StepConfig, StepName, OnboardingProgress } from './types';
import { REQUIRED_STEPS } from './constants';

export const STEPS: StepConfig[] = [
  {
    number: 1,
    name: 'identity',
    slug: 'identity',
    path: '/(student)/onboarding/identity',
    label: 'Identity',
    description: 'Personal information',
    weight: 0.15,
    required: true,
    icon: 'User',
  },
  {
    number: 2,
    name: 'education',
    slug: 'education',
    path: '/(student)/onboarding/education',
    label: 'Education',
    description: 'Educational background',
    weight: 0.20,
    required: true,
    icon: 'GraduationCap',
  },
  {
    number: 3,
    name: 'skills',
    slug: 'skills',
    path: '/(student)/onboarding/skills',
    label: 'Skills',
    description: 'Your abilities & expertise',
    weight: 0.20,
    required: true,
    icon: 'Zap',
  },
  {
    number: 4,
    name: 'experience',
    slug: 'experience',
    path: '/(student)/onboarding/experience',
    label: 'Experience',
    description: 'Work & activities',
    weight: 0.15,
    required: false,
    icon: 'Briefcase',
  },
  {
    number: 5,
    name: 'career-goals',
    slug: 'career-goals',
    path: '/(student)/onboarding/career-goals',
    label: 'Career Goals',
    description: 'Your ideal path',
    weight: 0.10,
    required: false,
    icon: 'Target',
  },
  {
    number: 6,
    name: 'global-preferences',
    slug: 'global-preferences',
    path: '/(student)/onboarding/global-preferences',
    label: 'Global Preferences',
    description: 'Mobility & languages',
    weight: 0.10,
    required: false,
    icon: 'Globe',
  },
  {
    number: 7,
    name: 'portfolio',
    slug: 'portfolio',
    path: '/(student)/onboarding/portfolio',
    label: 'Portfolio',
    description: 'Showcase your work',
    weight: 0.10,
    required: false,
    icon: 'FolderOpen',
  },
  {
    number: 8,
    name: 'complete',
    slug: 'complete',
    path: '/(student)/onboarding/complete',
    label: 'Complete',
    description: 'Profile summary',
    weight: 0,
    required: false,
    icon: 'CheckCircle',
  },
];

export function getStepByNumber(n: number): StepConfig | undefined {
  return STEPS.find((s) => s.number === n);
}

export function getStepBySlug(slug: string): StepConfig | undefined {
  return STEPS.find((s) => s.slug === slug);
}

export function getNextStep(current: number): StepConfig | undefined {
  return STEPS.find((s) => s.number === current + 1);
}

export function getPrevStep(current: number): StepConfig | undefined {
  return STEPS.find((s) => s.number === current - 1);
}

export function isStepAccessible(
  stepNum: number,
  progress: OnboardingProgress
): boolean {
  if (stepNum <= 1) return true;
  if (stepNum === progress.current_step) return true;
  if (stepNum < progress.current_step) return true;

  // For step 8 (complete): all required steps must be completed
  if (stepNum === 8) {
    return REQUIRED_STEPS.every((reqStep) => {
      const stepName = STEPS.find((s) => s.number === reqStep)?.slug;
      return stepName && progress.step_statuses[stepName] === 'completed';
    });
  }

  // Check all prior required steps are completed or skipped
  for (let i = 1; i < stepNum; i++) {
    const step = STEPS.find((s) => s.number === i);
    if (!step) continue;
    if (step.required) {
      const status = progress.step_statuses[step.slug];
      if (status !== 'completed') return false;
    }
  }
  return true;
}

export function getStepSlugForNumber(n: number): string {
  return STEPS.find((s) => s.number === n)?.slug ?? 'identity';
}
