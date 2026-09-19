import { UserRole } from '@/types/auth';

export const AUTH_ROUTES = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',
  verifyOtp: '/verify-otp',
  roleSelect: '/role-select',
  callback: '/auth/callback',
  mfaSetup: '/auth/mfa-setup',
  mfaVerify: '/auth/mfa-verify',
} as const;

export const PROTECTED_ROUTE_PREFIXES = [
  '/student',
  '/employer',
  '/university',
  '/provider',
  '/admin',
] as const;

export const AUTH_PAGE_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/verify-otp',
  '/role-select',
] as const;

export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  student: '/student/dashboard',
  employer: '/employer/dashboard',
  university_admin: '/university/dashboard',
  program_provider: '/provider/dashboard',
  platform_admin: '/admin/dashboard',
} as const;

export const ROLE_ONBOARDING: Record<UserRole, string> = {
  student: '/student/onboarding',
  employer: '/employer/setup',
  university_admin: '/university/setup',
  program_provider: '/provider/setup',
  platform_admin: '/admin/setup',
} as const;

export const ROLE_ROUTE_PREFIX: Record<UserRole, string> = {
  student: '/student',
  employer: '/employer',
  university_admin: '/university',
  program_provider: '/provider',
  platform_admin: '/admin',
} as const;

export const RATE_LIMITS = {
  login: { limit: 10, windowSeconds: 60 },
  register: { limit: 5, windowSeconds: 3600 },
  forgotPassword: { limit: 3, windowSeconds: 3600 },
  resendVerification: { limit: 5, windowSeconds: 86400 },
  otpSend: { limit: 3, windowSeconds: 3600 },
  otpSendDaily: { limit: 10, windowSeconds: 86400 },
  bruteForce: { limit: 5, windowSeconds: 900 },
} as const;

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:\',.<>?/',
} as const;

export const SESSION_CONFIG = {
  maxConcurrent: 5,
  accessTokenTTL: 3600,
  refreshTokenTTL: 2592000,
  lockoutDuration: 900,
  otpExpiry: 60,
  verificationLinkExpiry: 86400,
} as const;

export const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;

export const COUNTRY_CODES = [
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+1', country: 'CA', flag: '🇨🇦', name: 'Canada' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+971', country: 'AE', flag: '🇦🇪', name: 'United Arab Emirates' },
  { code: '+966', country: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
  { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
  { code: '+55', country: 'BR', flag: '🇧🇷', name: 'Brazil' },
  { code: '+52', country: 'MX', flag: '🇲🇽', name: 'Mexico' },
  { code: '+234', country: 'NG', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+254', country: 'KE', flag: '🇰🇪', name: 'Kenya' },
  { code: '+27', country: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  { code: '+65', country: 'SG', flag: '🇸🇬', name: 'Singapore' },
  { code: '+60', country: 'MY', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+63', country: 'PH', flag: '🇵🇭', name: 'Philippines' },
  { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
] as const;
