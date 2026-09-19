-- Enable RLS on organizations and opportunities tables
-- These were missing RLS which allows unrestricted access via anon key

-- ============================================================
-- ORGANIZATIONS RLS
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read organizations (marketplace display)
CREATE POLICY "organizations_select_authenticated"
ON organizations FOR SELECT
TO authenticated
USING (true);

-- Providers can insert organizations (during setup)
CREATE POLICY "organizations_insert_provider"
ON organizations FOR INSERT
TO authenticated
WITH CHECK (true);

-- Providers can update their own organization (linked via provider profile)
CREATE POLICY "organizations_update_own"
ON organizations FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT organization_id FROM program_provider_profiles
    WHERE user_id = auth.uid()
  )
);

-- ============================================================
-- OPPORTUNITIES RLS
-- ============================================================

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read published opportunities
CREATE POLICY "opportunities_select_published"
ON opportunities FOR SELECT
TO authenticated
USING (status = 'published' OR organization_id IN (
  SELECT organization_id FROM program_provider_profiles WHERE user_id = auth.uid()
));

-- Providers can insert opportunities for their organization
CREATE POLICY "opportunities_insert_own_org"
ON opportunities FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM program_provider_profiles
    WHERE user_id = auth.uid()
  )
);

-- Providers can update their own organization's opportunities
CREATE POLICY "opportunities_update_own_org"
ON opportunities FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM program_provider_profiles
    WHERE user_id = auth.uid()
  )
);

-- Providers can delete their own organization's opportunities
CREATE POLICY "opportunities_delete_own_org"
ON opportunities FOR DELETE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM program_provider_profiles
    WHERE user_id = auth.uid()
  )
);
