'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  StepStatus,
  IdentityData,
  EducationEntry,
  SkillEntry,
  ExperienceEntry,
  CareerGoalsData,
  GlobalPreferencesData,
  PortfolioItem,
  ExternalLinkEntry,
  OnboardingProgress,
} from '@/lib/onboarding/types';

interface OnboardingState {
  // Progress
  currentStep: number;
  stepStatuses: Record<string, StepStatus>;
  completionPercentage: number;
  startedAt: string | null;
  lastSavedAt: string | null;

  // Step data
  identity: IdentityData;
  education: { entries: EducationEntry[] };
  skills: { skills: SkillEntry[] };
  experience: { entries: ExperienceEntry[] };
  careerGoals: CareerGoalsData;
  globalPreferences: GlobalPreferencesData;
  portfolio: { items: PortfolioItem[]; external_links: ExternalLinkEntry[] };

  // Save state
  dirtySteps: string[];
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  saveError: string | null;

  // Actions
  setStepData: (step: string, data: unknown) => void;
  markDirty: (step: string) => void;
  markClean: (step: string) => void;
  setSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error', error?: string) => void;
  setCurrentStep: (step: number) => void;
  setStepStatus: (step: string, status: StepStatus) => void;
  setCompletionPercentage: (pct: number) => void;
  updateLastSaved: () => void;
  resetStore: () => void;
  hydrateFromServer: (progress: OnboardingProgress, stepData: Record<string, unknown>) => void;
}

const emptyIdentity: IdentityData = {
  first_name: '',
  last_name: '',
  middle_name: '',
  preferred_name: '',
  date_of_birth: '',
  gender: '',
  pronouns: '',
  nationality: '',
  country_of_residence: '',
  city: '',
  phone_number: '',
  bio: '',
  profile_photo_url: '',
  profile_photo_thumbnail_url: '',
};

const emptyCareerGoals: CareerGoalsData = {
  preferred_industries: [],
  preferred_functions: [],
  preferred_countries: [],
  work_mode: '',
  salary_min: null,
  salary_max: null,
  salary_currency: 'USD',
  salary_period: '',
  availability_date: '',
  mobility_readiness: null,
  visa_sponsorship_needed: null,
  visa_details: '',
};

const emptyGlobalPreferences: GlobalPreferencesData = {
  languages: [],
  preferred_program_types: [],
  relocation_willingness: '',
  relocation_conditions: '',
  cultural_interests: [],
  travel_experience: '',
};

const defaultStatuses: Record<string, StepStatus> = {
  identity: 'pending',
  education: 'pending',
  skills: 'pending',
  experience: 'pending',
  'career-goals': 'pending',
  'global-preferences': 'pending',
  portfolio: 'pending',
  complete: 'pending',
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 1,
      stepStatuses: { ...defaultStatuses },
      completionPercentage: 0,
      startedAt: null,
      lastSavedAt: null,

      identity: { ...emptyIdentity },
      education: { entries: [] },
      skills: { skills: [] },
      experience: { entries: [] },
      careerGoals: { ...emptyCareerGoals },
      globalPreferences: { ...emptyGlobalPreferences },
      portfolio: { items: [], external_links: [] },

      dirtySteps: [],
      saveStatus: 'idle',
      saveError: null,

      setStepData: (step, data) =>
        set((state) => {
          const mapping: Record<string, string> = {
            identity: 'identity',
            education: 'education',
            skills: 'skills',
            experience: 'experience',
            'career-goals': 'careerGoals',
            'global-preferences': 'globalPreferences',
            portfolio: 'portfolio',
          };
          const key = mapping[step];
          if (!key) return state;
          return { ...state, [key]: data } as unknown as OnboardingState;
        }),

      markDirty: (step) =>
        set((state) => ({
          dirtySteps: state.dirtySteps.includes(step)
            ? state.dirtySteps
            : [...state.dirtySteps, step],
        })),

      markClean: (step) =>
        set((state) => ({
          dirtySteps: state.dirtySteps.filter((s) => s !== step),
        })),

      setSaveStatus: (status, error) =>
        set({ saveStatus: status, saveError: error ?? null }),

      setCurrentStep: (step) => set({ currentStep: step }),

      setStepStatus: (step, status) =>
        set((state) => ({
          stepStatuses: { ...state.stepStatuses, [step]: status },
        })),

      setCompletionPercentage: (pct) => set({ completionPercentage: pct }),

      updateLastSaved: () => set({ lastSavedAt: new Date().toISOString() }),

      resetStore: () =>
        set({
          currentStep: 1,
          stepStatuses: { ...defaultStatuses },
          completionPercentage: 0,
          startedAt: null,
          lastSavedAt: null,
          identity: { ...emptyIdentity },
          education: { entries: [] },
          skills: { skills: [] },
          experience: { entries: [] },
          careerGoals: { ...emptyCareerGoals },
          globalPreferences: { ...emptyGlobalPreferences },
          portfolio: { items: [], external_links: [] },
          dirtySteps: [],
          saveStatus: 'idle',
          saveError: null,
        }),

      hydrateFromServer: (progress, stepData) =>
        set((state) => ({
          ...state,
          currentStep: progress.current_step,
          stepStatuses: progress.step_statuses ?? { ...defaultStatuses },
          completionPercentage: progress.completion_percentage,
          startedAt: progress.started_at,
          lastSavedAt: progress.last_saved_at,
          ...(stepData.identity ? { identity: stepData.identity as IdentityData } : {}),
          ...(stepData.education ? { education: stepData.education as { entries: EducationEntry[] } } : {}),
          ...(stepData.skills ? { skills: stepData.skills as { skills: SkillEntry[] } } : {}),
          ...(stepData.experience ? { experience: stepData.experience as { entries: ExperienceEntry[] } } : {}),
          ...(stepData['career-goals'] ? { careerGoals: stepData['career-goals'] as CareerGoalsData } : {}),
          ...(stepData['global-preferences'] ? { globalPreferences: stepData['global-preferences'] as GlobalPreferencesData } : {}),
          ...(stepData.portfolio ? { portfolio: stepData.portfolio as { items: PortfolioItem[]; external_links: ExternalLinkEntry[] } } : {}),
        })),
    }),
    {
      name: 'gx-onboarding-store',
      partialize: (state) => ({
        currentStep: state.currentStep,
        stepStatuses: state.stepStatuses,
        completionPercentage: state.completionPercentage,
        startedAt: state.startedAt,
        lastSavedAt: state.lastSavedAt,
        identity: state.identity,
        education: state.education,
        skills: state.skills,
        experience: state.experience,
        careerGoals: state.careerGoals,
        globalPreferences: state.globalPreferences,
        portfolio: state.portfolio,
      }),
    }
  )
);
