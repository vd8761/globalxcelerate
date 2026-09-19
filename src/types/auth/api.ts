import { UserRole, OnboardingStatus, AuthEventType } from './enums';

// Generic API Response
export interface AuthApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
    request_id?: string;
  };
  meta?: {
    timestamp: string;
    request_id: string;
  };
}

// Registration
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  tosAgreed: boolean;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  emailSent: boolean;
  message: string;
}

// Login
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  userId: string;
  role: UserRole | null;
  onboardingStatus: OnboardingStatus | null;
  redirectTo: string;
  mfaRequired?: boolean;
  mfaFactorId?: string;
}

// OTP
export interface OtpSendRequest {
  phone: string;
  countryCode?: string;
}

export interface OtpSendResponse {
  maskedPhone: string;
  expiresIn: number;
  message: string;
}

export interface OtpVerifyRequest {
  phone: string;
  code: string;
}

export interface OtpVerifyResponse {
  userId: string;
  role: UserRole | null;
  redirectTo: string;
  isNewUser: boolean;
}

// Role Selection
export interface RoleSelectRequest {
  role: UserRole;
}

export interface RoleSelectResponse {
  role: UserRole;
  profileId: string;
  redirectTo: string;
}

// Password Recovery
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
  redirectTo: string;
}

// MFA
export interface MfaEnrollResponse {
  factorId: string;
  qrCode: string;
  secret: string;
  uri: string;
}

export interface MfaVerifyRequest {
  factorId: string;
  code: string;
}

export interface MfaVerifyResponse {
  verified: boolean;
  recoveryCodes?: string[];
}

export interface MfaRecoveryRequest {
  code: string;
}

export interface MfaRecoveryResponse {
  verified: boolean;
  remainingCodes: number;
}

// Sessions
export interface SessionInfo {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface SessionListResponse {
  sessions: SessionInfo[];
  total: number;
}

// Resend Verification
export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
}

// Health
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  supabase: boolean;
  timestamp: string;
}
