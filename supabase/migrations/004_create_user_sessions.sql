-- Migration: Create user_sessions table
-- Description: Tracks active user sessions for concurrent session management

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token_hash TEXT NOT NULL,
  device_info TEXT,
  browser TEXT,
  os TEXT,
  ip_address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  terminated_at TIMESTAMPTZ,
  terminated_reason session_termination_reason,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_session_token UNIQUE (session_token_hash)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active
  ON user_sessions (user_id, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_sessions_expires
  ON user_sessions (expires_at) WHERE is_active = true;

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
