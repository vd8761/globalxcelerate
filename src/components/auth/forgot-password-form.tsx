'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2 } from 'lucide-react';
import type { ForgotPasswordFormValues } from '@/types/auth';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);

    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      setIsSuccess(true);
      setCooldown(60);
    } catch {
      // Always show success (no email enumeration)
      setIsSuccess(true);
      setCooldown(60);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-4 animate-scale-in">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-[#10B981]/10 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-[#10B981]" />
          </div>
        </div>
        <p className="text-sm text-[#64748B] mb-4 max-w-xs mx-auto">
          If an account exists with that email, a password reset link has been sent.
        </p>
        {cooldown > 0 && (
          <p className="text-xs text-[#64748B]">Resend available in {cooldown}s</p>
        )}
        {cooldown === 0 && (
          <button
            type="button"
            onClick={() => setIsSuccess(false)}
            className="text-sm font-medium text-[#06B6D4] hover:text-[#0891B2] transition-colors"
          >
            Send again
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="fp-email" className="block text-sm font-medium text-[#0F172A] mb-1.5">
          Email address
        </label>
        <input
          id="fp-email"
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

      <button
        type="submit"
        disabled={isLoading || cooldown > 0}
        className="w-full h-11 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : cooldown > 0 ? (
          `Resend in ${cooldown}s`
        ) : (
          'Send Reset Link'
        )}
      </button>
    </form>
  );
}
