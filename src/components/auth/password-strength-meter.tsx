'use client';

import { useMemo } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { score, label } = useMemo(() => {
    if (!password) return { score: 0, label: '' };

    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[!@#$%^&*()_+\-=\[\]{}|;:',.<>?/]/.test(password)) s++;

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return { score: s, label: labels[s] };
  }, [password]);

  if (!password) return null;

  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const textColors = ['', 'text-red-600', 'text-orange-600', 'text-yellow-600', 'text-green-600'];

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              segment <= score ? colors[score] : 'bg-[#E2E8F0]'
            }`}
          />
        ))}
      </div>
      {label && (
        <p className={`mt-1 text-xs font-medium ${textColors[score]}`}>
          {label}
        </p>
      )}
    </div>
  );
}
