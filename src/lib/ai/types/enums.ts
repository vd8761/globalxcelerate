export type CopilotMessageRole = 'user' | 'assistant' | 'system';

export type GXGradeBracket = 'beginner' | 'emerging' | 'developing' | 'strong' | 'exceptional';

export type GXDimension =
  | 'academic_readiness'
  | 'technical_skills'
  | 'communication'
  | 'leadership'
  | 'project_experience'
  | 'internship_experience'
  | 'international_exposure'
  | 'certifications'
  | 'portfolio_quality'
  | 'interview_readiness'
  | 'languages'
  | 'industry_skills';

export type RecommendationPriority = 'high' | 'medium' | 'low';

export type ScoreTriggerType = 'profile_update' | 'nightly_batch' | 'manual_recalc' | 'admin_override';

export type MatchCalculationStatus = 'idle' | 'calculating' | 'completed' | 'failed' | 'stale';
