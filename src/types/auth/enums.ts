export type UserRole = 'student' | 'employer' | 'university_admin' | 'program_provider' | 'platform_admin';

export type OnboardingStatus = 'not_started' | 'in_progress' | 'complete';

export type AuthEventType =
  | 'register_email'
  | 'register_oauth'
  | 'register_phone'
  | 'login_email'
  | 'login_oauth'
  | 'login_phone'
  | 'login_mfa'
  | 'logout'
  | 'password_reset_request'
  | 'password_reset_complete'
  | 'email_verification'
  | 'phone_verification'
  | 'role_selected'
  | 'mfa_enrolled'
  | 'mfa_verified'
  | 'mfa_recovery_used'
  | 'session_refresh'
  | 'session_terminated'
  | 'account_locked'
  | 'account_unlocked'
  | 'profile_created';

export type SessionTerminationReason =
  | 'logout'
  | 'expired'
  | 'revoked'
  | 'concurrent_limit'
  | 'password_changed'
  | 'admin_action';

export type GxGrade = 'exceptional' | 'strong' | 'developing' | 'emerging' | 'beginner';

export type ProfileVisibility = 'public' | 'private' | 'employer_only';

export type OAuthProvider = 'google' | 'azure' | 'apple' | 'linkedin_oidc';
