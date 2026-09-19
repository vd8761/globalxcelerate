-- Migration: Create auth-related enums
-- Description: Defines all enum types used by the authentication module

DO $$ BEGIN
  -- Auth event types
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_event_type') THEN
    CREATE TYPE auth_event_type AS ENUM (
      'register_email',
      'register_oauth',
      'register_phone',
      'login_email',
      'login_oauth',
      'login_phone',
      'login_mfa',
      'logout',
      'password_reset_request',
      'password_reset_complete',
      'email_verification',
      'phone_verification',
      'role_selected',
      'mfa_enrolled',
      'mfa_verified',
      'mfa_recovery_used',
      'session_refresh',
      'session_terminated',
      'account_locked',
      'account_unlocked',
      'profile_created'
    );
  END IF;

  -- User roles
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM (
      'student',
      'employer',
      'university_admin',
      'program_provider',
      'platform_admin'
    );
  END IF;

  -- Onboarding status
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'onboarding_status') THEN
    CREATE TYPE onboarding_status AS ENUM (
      'not_started',
      'in_progress',
      'complete'
    );
  END IF;

  -- Session termination reasons
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_termination_reason') THEN
    CREATE TYPE session_termination_reason AS ENUM (
      'logout',
      'expired',
      'revoked',
      'concurrent_limit',
      'password_changed',
      'admin_action'
    );
  END IF;
END $$;
