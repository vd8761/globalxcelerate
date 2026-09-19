'use client';

import { useState, useEffect } from 'react';
import { Loader2, Copy, Check } from 'lucide-react';

interface MfaSetupFormProps {
  onVerified: (recoveryCodes: string[]) => void;
}

export function MfaSetupForm({ onVerified }: MfaSetupFormProps) {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(true);
  const [verifyCode, setVerifyCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    enrollMfa();
  }, []);

  const enrollMfa = async () => {
    setIsEnrolling(true);
    try {
      const res = await fetch('/api/auth/mfa/enroll', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Failed to set up MFA.');
        return;
      }

      setQrCode(data.data?.qrCode || '');
      setSecret(data.data?.secret || '');
      setFactorId(data.data?.factorId || '');
    } catch {
      setError('Failed to initialize MFA setup.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleVerify = async () => {
    if (verifyCode.length !== 6) return;
    setIsVerifying(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factorId, code: verifyCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Invalid verification code.');
        setVerifyCode('');
        return;
      }

      if (data.data?.recoveryCodes) {
        onVerified(data.data.recoveryCodes);
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isEnrolling) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#06B6D4]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* QR Code */}
      {qrCode && (
        <div className="flex justify-center">
          <div
            className="p-4 bg-white rounded-xl border border-[#E2E8F0]"
            dangerouslySetInnerHTML={{ __html: qrCode }}
          />
        </div>
      )}

      {/* Manual entry secret */}
      {secret && (
        <div>
          <p className="text-xs text-[#64748B] mb-1.5">Or enter this key manually:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm font-mono text-[#0F172A] break-all">
              {secret}
            </code>
            <button
              type="button"
              onClick={handleCopySecret}
              className="p-2 rounded-lg border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors"
              aria-label="Copy secret"
            >
              {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4 text-[#64748B]" />}
            </button>
          </div>
        </div>
      )}

      {/* Verification input */}
      <div>
        <label htmlFor="mfa-code" className="block text-sm font-medium text-[#0F172A] mb-1.5">
          Verification code
        </label>
        <input
          id="mfa-code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={verifyCode}
          onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
          disabled={isVerifying}
          className="w-full h-11 px-3.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm text-center tracking-[0.5em] font-mono placeholder:text-[#64748B] placeholder:tracking-normal focus:outline-none focus:border-[#06B6D4] focus:ring-[3px] focus:ring-[#06B6D4]/10 disabled:opacity-50 transition-all"
          placeholder="000000"
        />
      </div>

      <button
        type="button"
        onClick={handleVerify}
        disabled={verifyCode.length !== 6 || isVerifying}
        className="w-full h-11 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Enable'}
      </button>
    </div>
  );
}
