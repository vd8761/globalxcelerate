export interface DimensionScore {
  score: number;
  weight: number;
  weighted_score: number;
  label: string;
}

export interface MatchDimensions {
  skills: DimensionScore;
  academic: DimensionScore;
  experience: DimensionScore;
  geography: DimensionScore;
  availability: DimensionScore;
  mobility: DimensionScore;
}

export interface MatchWeights {
  skills: number;
  academic: number;
  experience: number;
  geography: number;
  availability: number;
  mobility: number;
}

export interface SkillGap {
  skill_name: string;
  priority: 'high' | 'medium' | 'low';
  proficiency_required: number;
  proficiency_current: number | null;
}

export interface MatchCalculationResult {
  student_id: string;
  opportunity_id: string;
  composite_score: number;
  dimensions: MatchDimensions;
  skill_gaps: SkillGap[];
  explanation?: string;
  improvement_suggestions?: string[];
  from_cache: boolean;
  calculated_at: string;
  expires_at: string;
}

export interface MatchScore {
  id: string;
  student_id: string;
  opportunity_id: string;
  composite_score: number;
  dimension_scores: MatchDimensions;
  skill_gaps: SkillGap[];
  explanation_text: string | null;
  explanation_generated_at: string | null;
  calculation_status: string;
  from_cache: boolean;
  calculated_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface BatchJobStatus {
  job_id: string;
  opportunity_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  matches_calculated: number;
  total_students: number;
  top_score: number | null;
  median_score: number | null;
  started_at: string;
  completed_at: string | null;
}

export interface BatchJobResult {
  job_id: string;
  status: 'completed' | 'partial' | 'failed';
  matches_calculated: number;
  top_score: number;
  median_score: number;
  candidates: CandidateRank[];
}

export interface CandidateRank {
  student_id: string;
  student_name: string;
  avatar_url: string | null;
  composite_score: number;
  dimensions: MatchDimensions;
  top_skills: string[];
  skill_gaps_count: number;
}
