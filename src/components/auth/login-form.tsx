'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Phone } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { LoginFormValues } from '@/types/auth';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndsAt, setLockoutEndsAt] = useState<Date | null>(null);
  const [isUnverified, setIsUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

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

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          setError('A connection error occurred. Please try again.');
          return;
        }

        if (errorData.error?.code === 'AUTH_LOCKED') {
          setIsLocked(true);
          setLockoutEndsAt(new Date(errorData.error.details?.[0]?.message || Date.now() + 900000));
        } else if (errorData.error?.code === 'EMAIL_NOT_VERIFIED') {
          setIsUnverified(true);
          setUnverifiedEmail(values.email);
        } else {
          setError(errorData.error?.message || 'Invalid email or password');
        }
        return;
      }

      const data = await res.json();

      if (data.data?.session) {
        const supabase = createClient();
        await supabase.auth.setSession({
          access_token: data.data.session.access_token,
          refresh_token: data.data.session.refresh_token,
        });
      }

      router.push(data.data?.redirectTo || '/role-select');
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      setIsUnverified(false);
      setError(null);
    } catch {
      // Silently handle
    }
  };

  const getLockoutTimeRemaining = () => {
    if (!lockoutEndsAt) return '';
    const diff = Math.max(0, Math.ceil((lockoutEndsAt.getTime() - Date.now()) / 60000));
    return `${diff} minute${diff !== 1 ? 's' : ''}`;
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {/* Lockout Alert */}
      {isLocked && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">
            Too many failed attempts. Please try again in {getLockoutTimeRemaining()} or{' '}
            <Link href="/forgot-password" className="font-medium underline">reset your password</Link>.
          </p>
        </div>
      )}

      {/* Unverified Email Alert */}
      {isUnverified && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-700">
            Your email hasn&apos;t been verified yet.{' '}
            <button
              type="button"
              onClick={handleResendVerification}
              className="font-medium underline hover:text-amber-900"
            >
              Resend verification email
            </button>
          </p>
        </div>
      )}

      {/* General Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#0F172A] mb-1.5">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          disabled={isLoading || isLocked}
          className="w-full h-11 px-3.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm placeholder:text-[#64748B] focus:outline-none focus:border-[#06B6D4] focus:ring-[3px] focus:ring-[#06B6D4]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          placeholder="you@example.com"
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <p className="mt-1.5 text-xs text-red-500">{form.formState.errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#0F172A] mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            disabled={isLoading || isLocked}
            className="w-full h-11 px-3.5 pr-11 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm placeholder:text-[#64748B] focus:outline-none focus:border-[#06B6D4] focus:ring-[3px] focus:ring-[#06B6D4]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            placeholder="Enter your password"
            {...form.register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="mt-1.5 text-xs text-red-500">{form.formState.errors.password.message}</p>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-[#E2E8F0] text-[#06B6D4] focus:ring-[#06B6D4] focus:ring-offset-0"
            {...form.register('rememberMe')}
          />
          <span className="text-sm text-[#64748B]">Remember me</span>
        </label>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-[#06B6D4] hover:text-[#0891B2] transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || isLocked}
        className="w-full h-11 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/50 focus:ring-offset-2"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          'Sign In'
        )}
      </button>

      {/* Phone Login Link */}
      <Link
        href="/verify-otp"
        className="w-full h-10 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1] font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Phone className="w-4 h-4" />
        Sign in with Phone
      </Link>
    </form>
  );
}
