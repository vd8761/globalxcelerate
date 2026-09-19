'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PasswordStrengthMeter } from './password-strength-meter';
import { VerificationSuccess } from './verification-success';
import type { RegisterFormValues } from '@/types/auth';

const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .refine((val) => !/^\d+$/.test(val), 'Name cannot be purely numeric'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must include at least one uppercase letter')
    .regex(/[0-9]/, 'Must include at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{}|;:',.<>?/]/, 'Must include at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  tosAgreed: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms to continue' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ title: string; message: string } | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      tosAgreed: false as unknown as true,
    },
  });

  const password = form.watch('password');

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          setSuccessInfo({
            title: 'Registration may have succeeded',
            message: 'We encountered a connection issue, but your account may have been created. Please try logging in.',
          });
          setIsSuccess(true);
          return;
        }

        if (errorData.error?.code === 'RES_002') {
          setSuccessInfo({
            title: 'Account already exists',
            message: 'An account with this email already exists. Please try logging in.',
          });
          setIsSuccess(true);
          return;
        }

        setError(errorData.error?.message || 'Unable to create account. Please try again.');
        return;
      }

      const data = await res.json();
      if (data.data?.requiresVerification === false && data.data?.session) {
        const supabase = createClient();
        await supabase.auth.setSession({
          access_token: data.data.session.access_token,
          refresh_token: data.data.session.refresh_token,
        });
        router.replace('/role-select');
        return;
      }
      setIsSuccess(true);
    } catch {
      setSuccessInfo({
        title: 'Registration may have succeeded',
        message: 'We encountered a connection issue, but your account may have been created. Please try logging in.',
      });
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <VerificationSuccess
        type="email-sent"
        email={form.getValues('email')}
        title={successInfo?.title || 'Check your email'}
        message={successInfo?.message || "We've sent a verification link to your email address. Click the link to verify your account."}
      />
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* General Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-[#0F172A] mb-1.5">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          disabled={isLoading}
          className="w-full h-11 px-3.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm placeholder:text-[#64748B] focus:outline-none focus:border-[#06B6D4] focus:ring-[3px] focus:ring-[#06B6D4]/10 disabled:opacity-50 transition-all"
          placeholder="John Doe"
          {...form.register('fullName')}
        />
        {form.formState.errors.fullName && (
          <p className="mt-1.5 text-xs text-red-500">{form.formState.errors.fullName.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium text-[#0F172A] mb-1.5">
          Email address
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          disabled={isLoading}
          className="w-full h-11 px-3.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm placeholder:text-[#64748B] focus:outline-none focus:border-[#06B6D4] focus:ring-[3px] focus:ring-[#06B6D4]/10 disabled:opacity-50 transition-all"
          placeholder="you@example.com"
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <p className="mt-1.5 text-xs text-red-500">{form.formState.errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="reg-password" className="block text-sm font-medium text-[#0F172A] mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            disabled={isLoading}
            className="w-full h-11 px-3.5 pr-11 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm placeholder:text-[#64748B] focus:outline-none focus:border-[#06B6D4] focus:ring-[3px] focus:ring-[#06B6D4]/10 disabled:opacity-50 transition-all"
            placeholder="Create a strong password"
            {...form.register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="mt-1.5 text-xs text-red-500">{form.formState.errors.password.message}</p>
        )}
        <PasswordStrengthMeter password={password || ''} />
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#0F172A] mb-1.5">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            disabled={isLoading}
            className="w-full h-11 px-3.5 pr-11 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm placeholder:text-[#64748B] focus:outline-none focus:border-[#06B6D4] focus:ring-[3px] focus:ring-[#06B6D4]/10 disabled:opacity-50 transition-all"
            placeholder="Confirm your password"
            {...form.register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {form.formState.errors.confirmPassword && (
          <p className="mt-1.5 text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>
        )}
      </div>

      {/* TOS Agreement */}
      <div className="flex items-start gap-2.5">
        <input
          id="tosAgreed"
          type="checkbox"
          className="mt-0.5 w-4 h-4 rounded border-[#E2E8F0] text-[#06B6D4] focus:ring-[#06B6D4] focus:ring-offset-0"
          {...form.register('tosAgreed')}
        />
        <label htmlFor="tosAgreed" className="text-sm text-[#64748B]">
          I agree to the{' '}
          <Link href="/terms" className="text-[#06B6D4] hover:text-[#0891B2] underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-[#06B6D4] hover:text-[#0891B2] underline">
            Privacy Policy
          </Link>
        </label>
      </div>
      {form.formState.errors.tosAgreed && (
        <p className="text-xs text-red-500 -mt-2">{form.formState.errors.tosAgreed.message}</p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/50 focus:ring-offset-2"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  );
}
