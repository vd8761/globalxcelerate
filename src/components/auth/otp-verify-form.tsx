'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';

interface OtpVerifyFormProps {
  phone: string;
  maskedPhone: string;
  onBack: () => void;
}

export function OtpVerifyForm({ phone, maskedPhone, onBack }: OtpVerifyFormProps) {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timeRemaining <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => setTimeRemaining((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError(null);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (value && index === 5) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split('');
      setCode(newCode);
      handleVerify(pasted);
    }
  };

  const handleVerify = async (otp: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Invalid or expired code. Please try again.');
        setCode(Array(6).fill(''));
        inputRefs.current[0]?.focus();
        return;
      }

      router.push(data.data?.redirectTo || '/role-select');
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setCode(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
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
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          Enter verification code
        </h1>
        <p className="text-[#64748B] text-sm">
          We sent a 6-digit code to <span className="font-medium text-[#0F172A]">{maskedPhone}</span>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* OTP Input */}
      <div className="flex justify-center gap-2.5 mb-6" onPaste={handlePaste}>
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInput(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={isLoading}
            className={`w-12 h-14 text-center text-xl font-semibold rounded-lg border-2 transition-all duration-200 focus:outline-none ${
              error
                ? 'border-red-300 focus:border-red-500'
                : digit
                  ? 'border-[#06B6D4] bg-[#06B6D4]/5'
                  : 'border-[#E2E8F0] focus:border-[#06B6D4]'
            } disabled:opacity-50`}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center mb-4">
          <Loader2 className="w-5 h-5 text-[#06B6D4] animate-spin" />
        </div>
      )}

      {/* Timer and Resend */}
      <div className="text-center mb-6">
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            className="text-sm font-medium text-[#06B6D4] hover:text-[#0891B2] transition-colors"
          >
            Resend Code
          </button>
        ) : (
          <p className="text-sm text-[#64748B]">
            Resend code in <span className="font-medium">0:{timeRemaining.toString().padStart(2, '0')}</span>
          </p>
        )}
      </div>

      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="w-full flex items-center justify-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Use a different number
      </button>
    </div>
  );
}
