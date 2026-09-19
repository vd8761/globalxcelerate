'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import type { LoginFormValues } from '@/types/auth';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

export function useLoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndsAt, setLockoutEndsAt] = useState<Date | null>(null);
  const [isUnverified, setIsUnverified] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    setIsLoading(true);
    setIsUnverified(false);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.code === 'AUTH_LOCKED') {
          setIsLocked(true);
          setLockoutEndsAt(new Date(data.error.details?.[0]?.message || Date.now() + 900000));
        } else if (data.error?.code === 'EMAIL_NOT_VERIFIED') {
          setIsUnverified(true);
        } else {
          setError(data.error?.message || 'Invalid email or password');
        }
        return;
      }

      if (data.data?.mfaRequired) {
        router.push(`/auth/mfa-verify?factorId=${data.data.mfaFactorId}`);
        return;
      }

      router.push(data.data?.redirectTo || '/role-select');
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading,
    error,
    isLocked,
    lockoutEndsAt,
    isUnverified,
  };
}
