import { UserRole } from './enums';

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  tosAgreed: boolean;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export interface OtpPhoneFormValues {
  countryCode: string;
  phone: string;
}

export interface OtpVerifyFormValues {
  code: string;
}

export interface RoleSelectFormValues {
  role: UserRole;
}

export interface MfaVerifyFormValues {
  code: string;
}

export interface MfaRecoveryFormValues {
  recoveryCode: string;
}
