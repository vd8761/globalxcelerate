'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function MfaVerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const factorId = searchParams.get('factorId') || '';
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

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

  const handleVerify = async (otp: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factorId, code: otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Invalid code. Please try again.');
        setCode(Array(6).fill(''));
        inputRefs.current[0]?.focus();
        return;
      }

      router.push('/student/dashboard');
    } catch {
      setError('Verification failed. Please try again.');
      setCode(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  if (showRecovery) {
    return <MfaRecoveryForm onBack={() => setShowRecovery(false)} />;
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex justify-center gap-2.5 mb-6">
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
              digit ? 'border-[#06B6D4] bg-[#06B6D4]/5' : 'border-[#E2E8F0] focus:border-[#06B6D4]'
            } disabled:opacity-50`}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center mb-4">
          <Loader2 className="w-5 h-5 text-[#06B6D4] animate-spin" />
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowRecovery(true)}
        className="w-full text-center text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
      >
        Use recovery code instead
      </button>
    </div>
  );
}

function MfaRecoveryForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [recoveryCode, setRecoveryCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCode.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/mfa/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: recoveryCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Invalid recovery code.');
        return;
      }

      if (data.data?.remainingCodes <= 2) {
        // Show warning but still redirect
        alert(`Warning: You only have ${data.data.remainingCodes} recovery codes remaining. Please set up new codes.`);
      }

      router.push('/student/dashboard');
    } catch {
      setError('Recovery failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="recovery-code" className="block text-sm font-medium text-[#0F172A] mb-1.5">
          Recovery code
        </label>
        <input
          id="recovery-code"
          type="text"
          value={recoveryCode}
          onChange={(e) => setRecoveryCode(e.target.value)}
          disabled={isLoading}
          className="w-full h-11 px-3.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm font-mono placeholder:text-[#64748B] focus:outline-none focus:border-[#06B6D4] focus:ring-[3px] focus:ring-[#06B6D4]/10 disabled:opacity-50 transition-all"
          placeholder="Enter recovery code"
          maxLength={10}
        />
      </div>

      <button
        type="submit"
        disabled={!recoveryCode.trim() || isLoading}
        className="w-full h-11 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Recovery Code'}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
      >
        Back to authenticator code
      </button>
    </form>
  );
}
