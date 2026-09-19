-- Migration: Create mfa_recovery_codes table
-- Description: Stores hashed MFA recovery codes for account recovery

CREATE TABLE IF NOT EXISTS mfa_recovery_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  code_index INTEGER NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_code_index UNIQUE (user_id, code_index)
);

-- Index for lookup
CREATE INDEX IF NOT EXISTS idx_mfa_recovery_user_unused
  ON mfa_recovery_codes (user_id, is_used) WHERE is_used = false;

-- Enable RLS
ALTER TABLE mfa_recovery_codes ENABLE ROW LEVEL SECURITY;
