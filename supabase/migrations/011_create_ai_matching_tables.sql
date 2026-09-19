-- Migration: 011_create_ai_matching_tables
-- Description: Create all tables, enums, indexes, and RLS policies for the AI Matching Engine module

-- ============================================
-- 1. ENUM TYPES
-- ============================================

DO $$ BEGIN
  CREATE TYPE copilot_message_role AS ENUM ('user', 'assistant', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE gx_grade_bracket AS ENUM ('beginner', 'emerging', 'developing', 'strong', 'exceptional');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE gx_dimension AS ENUM (
    'academic_readiness', 'technical_skills', 'communication', 'leadership',
    'project_experience', 'internship_experience', 'international_exposure',
    'certifications', 'portfolio_quality', 'interview_readiness', 'languages', 'industry_skills'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE recommendation_priority AS ENUM ('high', 'medium', 'low');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE score_trigger_type AS ENUM ('profile_update', 'nightly_batch', 'manual_recalc', 'admin_override');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE match_calculation_status AS ENUM ('idle', 'calculating', 'completed', 'failed', 'stale');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 2. MATCH_SCORES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL,
  composite_score DECIMAL(5,2) NOT NULL CHECK (composite_score >= 0 AND composite_score <= 100),
  dimension_scores JSONB NOT NULL DEFAULT '{}',
  skill_gaps JSONB DEFAULT '[]',
  explanation_text TEXT,
  explanation_generated_at TIMESTAMPTZ,
  calculation_status match_calculation_status NOT NULL DEFAULT 'completed',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_match_scores_opportunity_score ON match_scores(opportunity_id, composite_score DESC);
CREATE INDEX IF NOT EXISTS idx_match_scores_student_expires ON match_scores(student_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_match_scores_expires ON match_scores(expires_at);

-- ============================================
-- 3. MATCH_WEIGHT_CONFIGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS match_weight_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_type VARCHAR(100) NOT NULL UNIQUE,
  skills_weight DECIMAL(4,2) NOT NULL DEFAULT 0.20,
  academic_weight DECIMAL(4,2) NOT NULL DEFAULT 0.20,
  experience_weight DECIMAL(4,2) NOT NULL DEFAULT 0.20,
  geography_weight DECIMAL(4,2) NOT NULL DEFAULT 0.15,
  availability_weight DECIMAL(4,2) NOT NULL DEFAULT 0.15,
  mobility_weight DECIMAL(4,2) NOT NULL DEFAULT 0.10,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT weights_sum_check CHECK (
    ABS((skills_weight + academic_weight + experience_weight + geography_weight + availability_weight + mobility_weight) - 1.00) < 0.02
  )
);

-- Seed default weight configs
INSERT INTO match_weight_configs (opportunity_type, skills_weight, academic_weight, experience_weight, geography_weight, availability_weight, mobility_weight)
VALUES
  ('default', 0.20, 0.20, 0.20, 0.15, 0.15, 0.10),
  ('technical_internship', 0.30, 0.15, 0.20, 0.15, 0.10, 0.10),
  ('cultural_exchange', 0.10, 0.10, 0.15, 0.15, 0.20, 0.30),
  ('research_placement', 0.25, 0.30, 0.20, 0.10, 0.10, 0.05)
ON CONFLICT (opportunity_type) DO NOTHING;

-- ============================================
-- 4. COPILOT_SESSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS copilot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  context_snapshot TEXT,
  messages_count INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_copilot_sessions_student_active ON copilot_sessions(student_id, is_active);
CREATE INDEX IF NOT EXISTS idx_copilot_sessions_student_activity ON copilot_sessions(student_id, last_activity_at DESC);

-- ============================================
-- 5. COPILOT_MESSAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS copilot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES copilot_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role copilot_message_role NOT NULL,
  content TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_copilot_messages_session_time ON copilot_messages(session_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_copilot_messages_student_time ON copilot_messages(student_id, created_at DESC);

-- ============================================
-- 6. COPILOT_RATE_LIMITS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS copilot_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  window_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  message_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(student_id, window_start)
);

CREATE INDEX IF NOT EXISTS idx_copilot_rate_limits_window_end ON copilot_rate_limits(window_end);

-- ============================================
-- 7. GX_SCORES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS gx_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  composite_score DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (composite_score >= 0 AND composite_score <= 100),
  grade_bracket gx_grade_bracket NOT NULL DEFAULT 'beginner',
  academic_readiness DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (academic_readiness >= 0 AND academic_readiness <= 100),
  technical_skills DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (technical_skills >= 0 AND technical_skills <= 100),
  communication DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (communication >= 0 AND communication <= 100),
  leadership DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (leadership >= 0 AND leadership <= 100),
  project_experience DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (project_experience >= 0 AND project_experience <= 100),
  internship_experience DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (internship_experience >= 0 AND internship_experience <= 100),
  international_exposure DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (international_exposure >= 0 AND international_exposure <= 100),
  certifications DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (certifications >= 0 AND certifications <= 100),
  portfolio_quality DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (portfolio_quality >= 0 AND portfolio_quality <= 100),
  interview_readiness DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (interview_readiness >= 0 AND interview_readiness <= 100),
  languages DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (languages >= 0 AND languages <= 100),
  industry_skills DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (industry_skills >= 0 AND industry_skills <= 100),
  daily_change DECIMAL(5,2) NOT NULL DEFAULT 0,
  anti_gaming_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gx_scores_composite ON gx_scores(composite_score DESC);
CREATE INDEX IF NOT EXISTS idx_gx_scores_grade ON gx_scores(grade_bracket);
CREATE INDEX IF NOT EXISTS idx_gx_scores_flagged ON gx_scores(anti_gaming_flagged) WHERE anti_gaming_flagged = TRUE;

-- ============================================
-- 8. GX_SCORE_HISTORY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS gx_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  composite_score DECIMAL(5,2) NOT NULL CHECK (composite_score >= 0 AND composite_score <= 100),
  dimension_scores JSONB NOT NULL DEFAULT '{}',
  grade_bracket gx_grade_bracket NOT NULL,
  change_delta DECIMAL(5,2) NOT NULL DEFAULT 0,
  trigger_type score_trigger_type NOT NULL DEFAULT 'profile_update',
  trigger_details TEXT,
  capped BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gx_score_history_student_desc ON gx_score_history(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gx_score_history_student_asc ON gx_score_history(student_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_gx_score_history_trigger ON gx_score_history(trigger_type);

-- ============================================
-- 9. GX_SCORE_RECOMMENDATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS gx_score_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dimension gx_dimension NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  action_url TEXT,
  priority recommendation_priority NOT NULL DEFAULT 'medium',
  estimated_impact DECIMAL(5,2) NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  is_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  dismiss_reason TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gx_recommendations_student_active ON gx_score_recommendations(student_id)
  WHERE is_completed = FALSE AND is_dismissed = FALSE;
CREATE INDEX IF NOT EXISTS idx_gx_recommendations_priority ON gx_score_recommendations(priority, estimated_impact DESC);

-- ============================================
-- 10. DISTRIBUTED_LOCKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS distributed_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lock_key VARCHAR(255) NOT NULL UNIQUE,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  owner VARCHAR(100) NOT NULL DEFAULT 'default'
);

CREATE INDEX IF NOT EXISTS idx_distributed_locks_expires ON distributed_locks(expires_at);

-- ============================================
-- 11. RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE match_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE copilot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE copilot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE copilot_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE gx_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE gx_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE gx_score_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_weight_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributed_locks ENABLE ROW LEVEL SECURITY;

-- match_scores: students can SELECT own rows
CREATE POLICY IF NOT EXISTS "students_select_own_match_scores" ON match_scores
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY IF NOT EXISTS "service_role_all_match_scores" ON match_scores
  FOR ALL USING (TRUE);

-- copilot_sessions: students can SELECT/INSERT own rows
CREATE POLICY IF NOT EXISTS "students_select_own_sessions" ON copilot_sessions
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY IF NOT EXISTS "students_insert_own_sessions" ON copilot_sessions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY IF NOT EXISTS "service_role_all_sessions" ON copilot_sessions
  FOR ALL USING (TRUE);

-- copilot_messages: students can SELECT/INSERT own rows
CREATE POLICY IF NOT EXISTS "students_select_own_messages" ON copilot_messages
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY IF NOT EXISTS "students_insert_own_messages" ON copilot_messages
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY IF NOT EXISTS "service_role_all_messages" ON copilot_messages
  FOR ALL USING (TRUE);

-- copilot_rate_limits: students can SELECT own rows
CREATE POLICY IF NOT EXISTS "students_select_own_rate_limits" ON copilot_rate_limits
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY IF NOT EXISTS "service_role_all_rate_limits" ON copilot_rate_limits
  FOR ALL USING (TRUE);

-- gx_scores: students can SELECT own row
CREATE POLICY IF NOT EXISTS "students_select_own_gx_score" ON gx_scores
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY IF NOT EXISTS "service_role_all_gx_scores" ON gx_scores
  FOR ALL USING (TRUE);

-- gx_score_history: students can SELECT own rows
CREATE POLICY IF NOT EXISTS "students_select_own_gx_history" ON gx_score_history
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY IF NOT EXISTS "service_role_all_gx_history" ON gx_score_history
  FOR ALL USING (TRUE);

-- gx_score_recommendations: students can SELECT/UPDATE own rows
CREATE POLICY IF NOT EXISTS "students_select_own_recommendations" ON gx_score_recommendations
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY IF NOT EXISTS "students_update_own_recommendations" ON gx_score_recommendations
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY IF NOT EXISTS "service_role_all_recommendations" ON gx_score_recommendations
  FOR ALL USING (TRUE);

-- match_weight_configs: read-only for all authenticated
CREATE POLICY IF NOT EXISTS "authenticated_read_weight_configs" ON match_weight_configs
  FOR SELECT USING (TRUE);

-- distributed_locks: service role only
CREATE POLICY IF NOT EXISTS "service_role_all_locks" ON distributed_locks
  FOR ALL USING (TRUE);

-- ============================================
-- 12. TRIGGERS for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER update_match_scores_updated_at
    BEFORE UPDATE ON match_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_match_weight_configs_updated_at
    BEFORE UPDATE ON match_weight_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_gx_scores_updated_at
    BEFORE UPDATE ON gx_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_gx_recommendations_updated_at
    BEFORE UPDATE ON gx_score_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
