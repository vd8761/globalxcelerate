-- Migration: Create role selection function
-- Description: Atomic function to assign role and create profile in a single transaction

CREATE OR REPLACE FUNCTION select_user_role(
  p_user_id UUID,
  p_role user_role
)
RETURNS TABLE(profile_id UUID, success BOOLEAN, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id UUID;
  v_existing_role TEXT;
BEGIN
  -- Advisory lock to prevent race conditions
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text || '_role_select'));

  -- Check if user already has a role
  SELECT raw_user_meta_data->>'role' INTO v_existing_role
  FROM auth.users
  WHERE id = p_user_id;

  IF v_existing_role IS NOT NULL AND v_existing_role != '' THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Role already assigned'::TEXT;
    RETURN;
  END IF;

  -- Create profile record based on role
  CASE p_role
    WHEN 'student' THEN
      INSERT INTO student_profiles (user_id, onboarding_status)
      VALUES (p_user_id, 'not_started')
      RETURNING id INTO v_profile_id;
    WHEN 'employer' THEN
      INSERT INTO employer_profiles (user_id, onboarding_status)
      VALUES (p_user_id, 'not_started')
      RETURNING id INTO v_profile_id;
    WHEN 'university_admin' THEN
      INSERT INTO university_admin_profiles (user_id, onboarding_status)
      VALUES (p_user_id, 'not_started')
      RETURNING id INTO v_profile_id;
    WHEN 'program_provider' THEN
      INSERT INTO program_provider_profiles (user_id, onboarding_status)
      VALUES (p_user_id, 'not_started')
      RETURNING id INTO v_profile_id;
    WHEN 'platform_admin' THEN
      INSERT INTO platform_admin_profiles (user_id, onboarding_status)
      VALUES (p_user_id, 'not_started')
      RETURNING id INTO v_profile_id;
  END CASE;

  -- Update user metadata with role
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', p_role::text, 'onboarding_completed', false)
  WHERE id = p_user_id;

  RETURN QUERY SELECT v_profile_id, TRUE, NULL::TEXT;
END;
$$;
