import { PASSWORD_REQUIREMENTS } from './constants';

interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  score: number;
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  if (password.length >= PASSWORD_REQUIREMENTS.minLength) {
    score++;
  } else {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  }

  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    errors.push('Must include at least one uppercase letter');
  }

  if (/[0-9]/.test(password)) {
    score++;
  } else {
    errors.push('Must include at least one number');
  }

  if (/[!@#$%^&*()_+\-=\[\]{}|;:',.<>?/]/.test(password)) {
    score++;
  } else {
    errors.push('Must include at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
    score,
  };
}

export function getPasswordStrength(password: string): number {
  if (!password) return 0;
  const { score } = validatePassword(password);
  return score;
}
