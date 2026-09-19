export interface GXScore {
  id: string;
  student_id: string;
  composite_score: number;
  grade_bracket: GXGradeBracket;
  academic_readiness: number;
  technical_skills: number;
  communication: number;
  leadership: number;
  project_experience: number;
  internship_experience: number;
  international_exposure: number;
  certifications: number;
  portfolio_quality: number;
  interview_readiness: number;
  languages: number;
  industry_skills: number;
  daily_change: number;
  anti_gaming_flagged: boolean;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
}

export type GXGradeBracket = 'beginner' | 'emerging' | 'developing' | 'strong' | 'exceptional';

export interface GXScoreHistory {
  id: string;
  student_id: string;
  composite_score: number;
  dimension_scores: Record<string, number>;
  grade_bracket: GXGradeBracket;
  change_delta: number;
  trigger_type: ScoreTriggerType;
  trigger_details: string | null;
  capped: boolean;
  created_at: string;
}

export type ScoreTriggerType = 'profile_update' | 'nightly_batch' | 'manual_recalc' | 'admin_override';

export interface GXScoreRecommendation {
  id: string;
  student_id: string;
  dimension: GXDimension;
  title: string;
  description: string;
  action_url: string | null;
  priority: RecommendationPriority;
  estimated_impact: number;
  is_completed: boolean;
  is_dismissed: boolean;
  completed_at: string | null;
  dismissed_at: string | null;
  expires_at: string;
  created_at: string;
}

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

export interface DimensionDefinition {
  id: GXDimension;
  label: string;
  description: string;
  icon: string;
}

export interface GradeBracket {
  id: GXGradeBracket;
  min: number;
  max: number;
  label: string;
  color: string;
}

export interface ScoreTrigger {
  type: ScoreTriggerType;
  details?: string;
  source_entity_id?: string;
}
