import type { MatchWeights } from '../types';

export const DEFAULT_WEIGHTS: MatchWeights = {
  skills: 0.20,
  academic: 0.20,
  experience: 0.20,
  geography: 0.15,
  availability: 0.15,
  mobility: 0.10,
};

export const OPPORTUNITY_TYPE_WEIGHTS: Record<string, MatchWeights> = {
  technical_internship: {
    skills: 0.30,
    academic: 0.15,
    experience: 0.20,
    geography: 0.15,
    availability: 0.10,
    mobility: 0.10,
  },
  cultural_exchange: {
    skills: 0.10,
    academic: 0.10,
    experience: 0.15,
    geography: 0.15,
    availability: 0.20,
    mobility: 0.30,
  },
  research_placement: {
    skills: 0.25,
    academic: 0.30,
    experience: 0.20,
    geography: 0.10,
    availability: 0.10,
    mobility: 0.05,
  },
};
