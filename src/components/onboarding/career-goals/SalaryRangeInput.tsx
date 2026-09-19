'use client';

import { COMMON_CURRENCIES } from '@/lib/onboarding/constants';

interface SalaryRangeInputProps {
  currency: string;
  min: number | null;
  max: number | null;
  period: string;
  onChange: (data: { currency?: string; min?: number | null; max?: number | null; period?: string }) => void;
}

export function SalaryRangeInput({ currency, min, max, period, onChange }: SalaryRangeInputProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div>
        <label className="block text-xs text-slate-500 mb-1">Currency</label>
        <select
          value={currency}
          onChange={(e) => onChange({ currency: e.target.value })}
          className="w-full px-2 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
        >
          {COMMON_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Minimum</label>
        <input
          type="number"
          value={min ?? ''}
          onChange={(e) => onChange({ min: e.target.value ? parseInt(e.target.value) : null })}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
          placeholder="Min"
          min="0"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Maximum</label>
        <input
          type="number"
          value={max ?? ''}
          onChange={(e) => onChange({ max: e.target.value ? parseInt(e.target.value) : null })}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
          placeholder="Max"
          min="0"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Period</label>
        <select
          value={period}
          onChange={(e) => onChange({ period: e.target.value })}
          className="w-full px-2 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
        >
          <option value="">Select</option>
          <option value="hourly">Hourly</option>
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </select>
      </div>
    </div>
  );
}
