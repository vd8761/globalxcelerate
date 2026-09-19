'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Phone, ArrowLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { COUNTRY_CODES } from '@/lib/auth/constants';
import type { OtpPhoneFormValues } from '@/types/auth';

const schema = z.object({
  countryCode: z.string().min(1, 'Country code is required'),
  phone: z.string().min(4, 'Phone number is required').max(15, 'Phone number too long'),
});

interface OtpPhoneFormProps {
  onCodeSent: (fullPhone: string, maskedPhone: string) => void;
}

export function OtpPhoneForm({ onCodeSent }: OtpPhoneFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const form = useForm<OtpPhoneFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { countryCode: '+1', phone: '' },
  });

  const selectedCountry = COUNTRY_CODES.find(
    (c) => c.code === form.watch('countryCode')
  ) || COUNTRY_CODES[0];

  const filteredCountries = COUNTRY_CODES.filter(
    (c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.includes(searchQuery)
  );

  const onSubmit = async (values: OtpPhoneFormValues) => {
    setError(null);
    setIsLoading(true);

    const fullPhone = `${values.countryCode}${values.phone.replace(/\s/g, '')}`;

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Failed to send code. Please try again.');
        return;
      }

      onCodeSent(fullPhone, data.data?.maskedPhone || fullPhone);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          Sign in with phone
        </h1>
        <p className="text-[#64748B] text-sm">
          Enter your phone number and we&apos;ll send you a verification code.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-[#0F172A] mb-1.5">
            Phone number
          </label>
          <div className="flex gap-2">
            {/* Country Code Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="h-11 px-3 rounded-lg border border-[#E2E8F0] bg-white text-sm flex items-center gap-1.5 hover:border-[#CBD5E1] transition-colors min-w-[90px]"
              >
                <span>{selectedCountry.flag}</span>
                <span className="text-[#0F172A]">{selectedCountry.code}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
              </button>

              {showDropdown && (
                <div className="absolute top-12 left-0 z-50 w-64 max-h-60 overflow-y-auto bg-white border border-[#E2E8F0] rounded-lg shadow-lg">
                  <div className="sticky top-0 p-2 bg-white border-b border-[#E2E8F0]">
                    <input
                      type="text"
                      placeholder="Search country..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-8 px-2.5 rounded border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#06B6D4]"
                    />
                  </div>
                  {filteredCountries.map((country, idx) => (
                    <button
                      key={`${country.country}-${idx}`}
                      type="button"
                      onClick={() => {
                        form.setValue('countryCode', country.code);
                        setShowDropdown(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-[#F8FAFC] flex items-center gap-2"
                    >
                      <span>{country.flag}</span>
                      <span className="text-[#0F172A]">{country.name}</span>
                      <span className="text-[#64748B] ml-auto">{country.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phone Input */}
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              disabled={isLoading}
              className="flex-1 h-11 px-3.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm placeholder:text-[#64748B] focus:outline-none focus:border-[#06B6D4] focus:ring-[3px] focus:ring-[#06B6D4]/10 disabled:opacity-50 transition-all"
              placeholder="555 123 4567"
              {...form.register('phone')}
            />
          </div>
          {form.formState.errors.phone && (
            <p className="mt-1.5 text-xs text-red-500">{form.formState.errors.phone.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Phone className="w-4 h-4" />
              Send Code
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
