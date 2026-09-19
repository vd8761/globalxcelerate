export type MatchGrade = 'excellent' | 'good' | 'fair' | 'low';

export interface MatchDimension {
  name: string;
  score: number;
  max: number;
  weight?: number;
}

export interface MatchAnalysis {
  overall_score: number;
  grade: MatchGrade;
  dimensions: MatchDimension[];
  explanation: string;
  strengths: string[];
  gaps: string[];
  computed_at: string;
}

export interface EligibilityCheckItem {
  requirement: string;
  status: 'pass' | 'fail' | 'warning';
  detail: string;
}

export interface EligibilityCheck {
  overall: boolean;
  checks: EligibilityCheckItem[];
  met_count: number;
  total_count: number;
}
