'use client';

import { useMemo } from 'react';

interface PasswordStrengthResult {
  score: number;
  label: 'none' | 'weak' | 'fair' | 'good' | 'strong';
  requirements: {
    hasMinLength: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export function usePasswordStrength(password: string): PasswordStrengthResult {
  return useMemo(() => {
    if (!password) {
      return {
        score: 0,
        label: 'none' as const,
        requirements: {
          hasMinLength: false,
          hasUppercase: false,
          hasNumber: false,
          hasSpecialChar: false,
        },
      };
    }

    const requirements = {
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{}|;:',.<>?/]/.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;
    const labels: Record<number, 'weak' | 'fair' | 'good' | 'strong'> = {
      1: 'weak',
      2: 'fair',
      3: 'good',
      4: 'strong',
    };

    return {
      score,
      label: labels[score] || 'none',
      requirements,
    };
  }, [password]);
}
