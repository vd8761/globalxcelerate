-- Marketplace Tables Migration
-- Created for GlobalXcelerate Opportunity Marketplace module

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE opportunity_category_enum AS ENUM ('internships', 'global_immersion', 'exchange', 'industry_projects', 'research', 'scholarships', 'graduate_careers');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE work_mode_enum AS ENUM ('on_site', 'remote', 'hybrid');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE duration_unit_enum AS ENUM ('weeks', 'months', 'years');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE compensation_type_enum AS ENUM ('paid', 'stipend', 'unpaid', 'scholarship');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE compensation_period_enum AS ENUM ('hourly', 'weekly', 'monthly', 'annual', 'total');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE opportunity_status_enum AS ENUM ('draft', 'pending_review', 'published', 'closed', 'archived');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE skill_importance_enum AS ENUM ('required', 'preferred', 'nice_to_have');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE application_status_enum AS ENUM ('submitted', 'under_review', 'shortlisted', 'interview', 'offered', 'accepted', 'rejected', 'withdrawn');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE analytics_event_enum AS ENUM ('view', 'save', 'unsave', 'share', 'apply_start', 'apply_submit', 'click_from_card');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- TABLES
-- ============================================================

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  industry TEXT,
  size TEXT,
  location_country TEXT,
  location_city TEXT,
  website TEXT,
  description TEXT,
  verified BOOLEAN DEFAULT false,
  opportunities_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Skills master
CREATE TABLE IF NOT EXISTS skills_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Industries
CREATE TABLE IF NOT EXISTS industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Opportunities
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  posted_by UUID,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 5 AND 200),
  slug TEXT NOT NULL UNIQUE,
  category opportunity_category_enum NOT NULL,
  description TEXT NOT NULL,
  description_plain TEXT,
  requirements JSONB DEFAULT '{}',
  benefits JSONB DEFAULT '[]',
  responsibilities JSONB DEFAULT '[]',
  application_fields JSONB DEFAULT '[]',
  location_country TEXT NOT NULL,
  location_city TEXT,
  work_mode work_mode_enum NOT NULL DEFAULT 'on_site',
  duration_value INTEGER,
  duration_unit duration_unit_enum DEFAULT 'months',
  compensation_type compensation_type_enum,
  compensation_min NUMERIC(10,2),
  compensation_max NUMERIC(10,2),
  compensation_currency TEXT DEFAULT 'USD',
  compensation_period compensation_period_enum DEFAULT 'monthly',
  visa_support BOOLEAN DEFAULT false,
  industry TEXT,
  start_date DATE,
  end_date DATE,
  application_deadline TIMESTAMPTZ,
  status opportunity_status_enum NOT NULL DEFAULT 'draft',
  spots_available INTEGER,
  spots_filled INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  search_vector TSVECTOR,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Opportunity Skills junction
CREATE TABLE IF NOT EXISTS opportunity_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills_master(id) ON DELETE CASCADE,
  importance skill_importance_enum NOT NULL DEFAULT 'required',
  min_proficiency INTEGER DEFAULT 1 CHECK (min_proficiency BETWEEN 1 AND 5),
  UNIQUE(opportunity_id, skill_id)
);

-- Saved opportunities
CREATE TABLE IF NOT EXISTS saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, opportunity_id)
);

-- Applications
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  reference_number TEXT NOT NULL UNIQUE,
  cover_letter TEXT,
  documents JSONB DEFAULT '[]',
  additional_answers JSONB DEFAULT '{}',
  status application_status_enum NOT NULL DEFAULT 'submitted',
  match_score_at_submission NUMERIC(5,2),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_by UUID,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, opportunity_id)
);

-- Match scores (pre-computed)
CREATE TABLE IF NOT EXISTS match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  total_score NUMERIC(5,2) NOT NULL CHECK (total_score BETWEEN 0 AND 100),
  dimension_scores JSONB NOT NULL DEFAULT '{}',
  explanation TEXT,
  strengths JSONB DEFAULT '[]',
  gaps JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
  UNIQUE(student_id, opportunity_id)
);

-- Opportunity analytics
CREATE TABLE IF NOT EXISTS opportunity_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id UUID,
  event analytics_event_enum NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Student profiles
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  gpa NUMERIC(3,2),
  degree_level TEXT,
  field_of_study TEXT,
  nationality TEXT,
  current_country TEXT,
  current_city TEXT,
  experience_months INTEGER DEFAULT 0,
  languages JSONB DEFAULT '[]',
  career_goals JSONB DEFAULT '{}',
  profile_completion INTEGER DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Student skills
CREATE TABLE IF NOT EXISTS student_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills_master(id) ON DELETE CASCADE,
  proficiency_level INTEGER DEFAULT 1 CHECK (proficiency_level BETWEEN 1 AND 5),
  UNIQUE(student_id, skill_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_opportunities_search_vector ON opportunities USING GIN (search_vector);

-- Trigram indexes for fuzzy search
CREATE INDEX IF NOT EXISTS idx_opportunities_title_trgm ON opportunities USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_opportunities_description_trgm ON opportunities USING GIN (description_plain gin_trgm_ops);

-- Filter indexes (partial for published only)
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities (category) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_opportunities_country ON opportunities (location_country) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_opportunities_work_mode ON opportunities (work_mode) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities (application_deadline) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities (status);
CREATE INDEX IF NOT EXISTS idx_opportunities_compensation ON opportunities (compensation_type, compensation_max) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_opportunities_industry ON opportunities (industry) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_opportunities_visa ON opportunities (visa_support) WHERE status = 'published' AND visa_support = true;
CREATE INDEX IF NOT EXISTS idx_opportunities_published_at ON opportunities (published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_opportunities_featured ON opportunities (featured, published_at DESC) WHERE status = 'published';

-- Junction and relational indexes
CREATE INDEX IF NOT EXISTS idx_opportunity_skills_opp ON opportunity_skills (opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_skills_skill ON opportunity_skills (skill_id);
CREATE INDEX IF NOT EXISTS idx_saved_opportunities_student ON saved_opportunities (student_id);
CREATE INDEX IF NOT EXISTS idx_saved_opportunities_opp ON saved_opportunities (opportunity_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications (student_id);
CREATE INDEX IF NOT EXISTS idx_applications_opp ON applications (opportunity_id);
CREATE INDEX IF NOT EXISTS idx_applications_ref ON applications (reference_number);
CREATE INDEX IF NOT EXISTS idx_match_scores_student ON match_scores (student_id);
CREATE INDEX IF NOT EXISTS idx_match_scores_opp ON match_scores (opportunity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_opp ON opportunity_analytics (opportunity_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user ON student_profiles (user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Search vector auto-update
CREATE OR REPLACE FUNCTION update_opportunity_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE((SELECT name FROM organizations WHERE id = NEW.organization_id), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description_plain, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.industry, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(NEW.location_country, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(NEW.location_city, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_opportunity_search_vector ON opportunities;
CREATE TRIGGER trg_opportunity_search_vector
  BEFORE INSERT OR UPDATE OF title, description_plain, industry, location_country, location_city, organization_id
  ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_opportunity_search_vector();

-- Updated_at auto-update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_opportunities_updated_at ON opportunities;
CREATE TRIGGER trg_opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_applications_updated_at ON applications;
CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
