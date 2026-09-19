-- Migration: Create admin_email_whitelist table
-- Description: Whitelist of emails/domains eligible for platform admin role

CREATE TABLE IF NOT EXISTS admin_email_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  domain TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  added_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_admin_email UNIQUE (email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_whitelist_active_email
  ON admin_email_whitelist (email) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_admin_whitelist_active_domain
  ON admin_email_whitelist (domain) WHERE is_active = true AND domain IS NOT NULL;

-- Enable RLS
ALTER TABLE admin_email_whitelist ENABLE ROW LEVEL SECURITY;

-- Seed default admin domain
INSERT INTO admin_email_whitelist (email, domain, is_active, notes)
VALUES ('*@globalxcelerate.com', 'globalxcelerate.com', true, 'Default admin domain')
ON CONFLICT (email) DO NOTHING;
