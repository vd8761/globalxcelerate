-- Migration: Create profile tables for each role
-- Description: One profile table per role type

-- Helper function for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_status onboarding_status NOT NULL DEFAULT 'not_started',
  first_name TEXT,
  last_name TEXT,
  username TEXT UNIQUE,
  date_of_birth DATE,
  nationality TEXT,
  current_country TEXT,
  current_city TEXT,
  profile_photo_url TEXT,
  bio TEXT,
  profile_completion INTEGER NOT NULL DEFAULT 0,
  gx_score DECIMAL(5,2),
  open_to_opportunities BOOLEAN NOT NULL DEFAULT true,
  visibility TEXT NOT NULL DEFAULT 'public',
  onboarding_step INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Employer Profiles
CREATE TABLE IF NOT EXISTS employer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_status onboarding_status NOT NULL DEFAULT 'not_started',
  company_name TEXT,
  job_title TEXT,
  industry TEXT,
  company_size TEXT,
  company_website TEXT,
  company_logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_employer_profiles_updated_at
  BEFORE UPDATE ON employer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- University Admin Profiles
CREATE TABLE IF NOT EXISTS university_admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_status onboarding_status NOT NULL DEFAULT 'not_started',
  institution_name TEXT,
  department TEXT,
  position TEXT,
  institution_website TEXT,
  institution_logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_university_admin_profiles_updated_at
  BEFORE UPDATE ON university_admin_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Program Provider Profiles
CREATE TABLE IF NOT EXISTS program_provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_status onboarding_status NOT NULL DEFAULT 'not_started',
  organization_name TEXT,
  program_type TEXT,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_program_provider_profiles_updated_at
  BEFORE UPDATE ON program_provider_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Platform Admin Profiles
CREATE TABLE IF NOT EXISTS platform_admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_status onboarding_status NOT NULL DEFAULT 'not_started',
  access_level TEXT NOT NULL DEFAULT 'standard',
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_platform_admin_profiles_updated_at
  BEFORE UPDATE ON platform_admin_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable RLS on all tables
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_admin_profiles ENABLE ROW LEVEL SECURITY;
