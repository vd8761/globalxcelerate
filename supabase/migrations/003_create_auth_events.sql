-- Migration: Create auth_events table
-- Description: Comprehensive audit log for all authentication-related events

CREATE TABLE IF NOT EXISTS auth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type auth_event_type NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  provider TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_code TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_auth_events_user_id
  ON auth_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_auth_events_type
  ON auth_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_auth_events_created_at
  ON auth_events (created_at DESC);

-- Enable RLS
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;
