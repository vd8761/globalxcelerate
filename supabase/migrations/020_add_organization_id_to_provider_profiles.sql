-- Add organization_id column to program_provider_profiles
-- This column is required for providers to create programs (opportunities)
-- as the opportunities table references organizations(id)

ALTER TABLE program_provider_profiles
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

CREATE INDEX IF NOT EXISTS idx_provider_profiles_org
ON program_provider_profiles (organization_id);
