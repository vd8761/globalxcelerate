'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseOtpReturn {
  step: 'phone' | 'verify';
  phone: string;
  maskedPhone: string;
  timeRemaining: number;
  canResend: boolean;
  isLoadingSend: boolean;
  isLoadingVerify: boolean;
  error: string | null;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<{ redirectTo?: string } | null>;
  resendOtp: () => Promise<void>;
  goBack: () => void;
}

export function useOtp(): UseOtpReturn {
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phone, setPhone] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isLoadingSend, setIsLoadingSend] = useState(false);
  const [isLoadingVerify, setIsLoadingVerify] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (timeRemaining <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => setTimeRemaining((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  const sendOtp = useCallback(async (phoneNumber: string) => {
    setIsLoadingSend(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Failed to send code.');
        return;
      }

      setPhone(phoneNumber);
      setMaskedPhone(data.data?.maskedPhone || phoneNumber);
      setTimeRemaining(60);
      setCanResend(false);
      setStep('verify');
    } catch {
      setError('Failed to send verification code.');
    } finally {
      setIsLoadingSend(false);
    }
  }, []);

  const verifyOtp = useCallback(async (code: string) => {
    setIsLoadingVerify(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Invalid or expired code.');
        return null;
      }

      return { redirectTo: data.data?.redirectTo };
    } catch {
      setError('Verification failed. Please try again.');
      return null;
    } finally {
      setIsLoadingVerify(false);
    }
  }, [phone]);

  const resendOtp = useCallback(async () => {
    if (!phone || !canResend) return;

    try {
      await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      setTimeRemaining(60);
      setCanResend(false);
      setError(null);
    } catch {
      setError('Failed to resend code.');
    }
  }, [phone, canResend]);

  const goBack = useCallback(() => {
    setStep('phone');
    setError(null);
  }, []);

  return {
    step,
    phone,
    maskedPhone,
    timeRemaining,
    canResend,
    isLoadingSend,
    isLoadingVerify,
    error,
    sendOtp,
    verifyOtp,
    resendOtp,
    goBack,
  };
}
