-- Migration: Create RLS policies
-- Description: Row Level Security policies for authentication tables

-- Auth events: Users can only read their own events
CREATE POLICY "Users can view own auth events"
  ON auth_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- User sessions: Users can read and delete their own sessions
CREATE POLICY "Users can view own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
  ON user_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- MFA recovery codes: Users can only view their own codes
CREATE POLICY "Users can view own recovery codes"
  ON mfa_recovery_codes
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own recovery codes"
  ON mfa_recovery_codes
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Admin whitelist: Readable by authenticated users (for role-select eligibility check)
CREATE POLICY "Authenticated users can check admin whitelist"
  ON admin_email_whitelist
  FOR SELECT
  TO authenticated
  USING (true);

-- Student profiles: Users can read/update their own
CREATE POLICY "Users can view own student profile"
  ON student_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own student profile"
  ON student_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own student profile"
  ON student_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Employer profiles
CREATE POLICY "Users can view own employer profile"
  ON employer_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own employer profile"
  ON employer_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own employer profile"
  ON employer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- University admin profiles
CREATE POLICY "Users can view own university admin profile"
  ON university_admin_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own university admin profile"
  ON university_admin_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own university admin profile"
  ON university_admin_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Program provider profiles
CREATE POLICY "Users can view own provider profile"
  ON program_provider_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own provider profile"
  ON program_provider_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own provider profile"
  ON program_provider_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Platform admin profiles
CREATE POLICY "Users can view own admin profile"
  ON platform_admin_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own admin profile"
  ON platform_admin_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own admin profile"
  ON platform_admin_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Login attempts: No direct access (server-only via service role)
-- No policies needed - defaults to deny all for authenticated users
