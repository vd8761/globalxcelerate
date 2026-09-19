'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { CareerGoalsData } from '@/lib/onboarding/types';
import { IndustrySelector } from './IndustrySelector';
import { FunctionSelector } from './FunctionSelector';
import { SalaryRangeInput } from './SalaryRangeInput';
import { MobilityReadinessSlider } from './MobilityReadinessSlider';
import { CountrySelect } from '@/components/onboarding/identity/CountrySelect';
import { X } from 'lucide-react';
import countriesData from '@/data/countries.json';

interface CareerGoalsFormProps {
  form: UseFormReturn<CareerGoalsData>;
}

export function CareerGoalsForm({ form }: CareerGoalsFormProps) {
  const { watch, setValue } = form;
  const countries = countriesData as { code: string; name: string; flag: string }[];

  const preferredCountries = watch('preferred_countries') ?? [];

  return (
    <div className="space-y-8">
      {/* Industries */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Preferred Industries</h3>
        <IndustrySelector
          selected={watch('preferred_industries') ?? []}
          onChange={(v) => setValue('preferred_industries', v, { shouldDirty: true })}
        />
      </div>

      {/* Functions */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Preferred Job Functions</h3>
        <FunctionSelector
          selected={watch('preferred_functions') ?? []}
          onChange={(v) => setValue('preferred_functions', v, { shouldDirty: true })}
        />
      </div>

      {/* Location */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Preferred Countries (max 10)</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {preferredCountries.map((code) => {
            const c = countries.find((co) => co.code === code);
            return (
              <span key={code} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-medium px-2 py-1 rounded-full">
                {c?.flag} {c?.name ?? code}
                <button type="button" onClick={() => setValue('preferred_countries', preferredCountries.filter((pc) => pc !== code), { shouldDirty: true })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
        {preferredCountries.length < 10 && (
          <CountrySelect
            value=""
            onChange={(code) => {
              if (!preferredCountries.includes(code)) {
                setValue('preferred_countries', [...preferredCountries, code], { shouldDirty: true });
              }
            }}
            placeholder="Add a country..."
          />
        )}
      </div>

      {/* Work mode */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Work Mode Preference</h3>
        <div className="flex flex-wrap gap-2">
          {(['remote', 'hybrid', 'on_site', 'no_preference'] as const).map((mode) => {
            const labels: Record<string, string> = { remote: 'Remote', hybrid: 'Hybrid', on_site: 'On-site', no_preference: 'No Preference' };
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setValue('work_mode', mode, { shouldDirty: true })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  watch('work_mode') === mode
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {labels[mode]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Salary */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Compensation Expectations</h3>
        <SalaryRangeInput
          currency={watch('salary_currency') ?? 'USD'}
          min={watch('salary_min')}
          max={watch('salary_max')}
          period={watch('salary_period') ?? ''}
          onChange={({ currency, min, max, period }) => {
            if (currency !== undefined) setValue('salary_currency', currency, { shouldDirty: true });
            if (min !== undefined) setValue('salary_min', min, { shouldDirty: true });
            if (max !== undefined) setValue('salary_max', max, { shouldDirty: true });
            if (period !== undefined) setValue('salary_period', period as CareerGoalsData['salary_period'], { shouldDirty: true });
          }}
        />
      </div>

      {/* Availability */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Available From</label>
          <input
            type="month"
            value={watch('availability_date') ?? ''}
            onChange={(e) => setValue('availability_date', e.target.value, { shouldDirty: true })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Mobility Readiness</label>
          <MobilityReadinessSlider
            value={watch('mobility_readiness')}
            onChange={(v) => setValue('mobility_readiness', v, { shouldDirty: true })}
          />
        </div>
      </div>

      {/* Visa */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={watch('visa_sponsorship_needed') ?? false}
            onChange={(e) => setValue('visa_sponsorship_needed', e.target.checked, { shouldDirty: true })}
            className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
          />
          <span className="text-sm text-slate-700">I need visa sponsorship</span>
        </label>
        {watch('visa_sponsorship_needed') && (
          <input
            value={watch('visa_details') ?? ''}
            onChange={(e) => setValue('visa_details', e.target.value, { shouldDirty: true })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
            placeholder="Any specific visa details or requirements"
            maxLength={200}
          />
        )}
      </div>
    </div>
  );
}
