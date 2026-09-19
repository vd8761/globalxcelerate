'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { IdentityData } from '@/lib/onboarding/types';
import { PhotoUploader } from './PhotoUploader';
import { CountrySelect } from './CountrySelect';
import { useOnboardingStore } from '@/stores/onboarding-store';

interface IdentityFormProps {
  form: UseFormReturn<IdentityData>;
}

export function IdentityForm({ form }: IdentityFormProps) {
  const { register, formState: { errors }, setValue, watch } = form;
  const photoUrl = watch('profile_photo_url');

  return (
    <div className="space-y-6">
      {/* Photo */}
      <div className="flex justify-center">
        <PhotoUploader
          currentPhotoUrl={photoUrl || null}
          onUploadComplete={(url) => {
            setValue('profile_photo_url', url, { shouldDirty: true });
            setValue('profile_photo_thumbnail_url', url, { shouldDirty: true });
          }}
        />
      </div>

      {/* Name fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('first_name')}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
            placeholder="Enter your first name"
          />
          {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('last_name')}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
            placeholder="Enter your last name"
          />
          {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Middle Name</label>
          <input
            {...register('middle_name')}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Name</label>
          <input
            {...register('preferred_name')}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
            placeholder="What should we call you?"
          />
        </div>
      </div>

      {/* Personal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register('date_of_birth')}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
          />
          {errors.date_of_birth && <p className="text-xs text-red-500 mt-1">{errors.date_of_birth.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
          <select
            {...register('gender')}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
          >
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Pronouns</label>
          <input
            {...register('pronouns')}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
            placeholder="e.g., they/them"
          />
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nationality <span className="text-red-500">*</span>
          </label>
          <CountrySelect
            value={watch('nationality')}
            onChange={(code) => setValue('nationality', code, { shouldValidate: true, shouldDirty: true })}
          />
          {errors.nationality && <p className="text-xs text-red-500 mt-1">{errors.nationality.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Country of Residence <span className="text-red-500">*</span>
          </label>
          <CountrySelect
            value={watch('country_of_residence')}
            onChange={(code) => setValue('country_of_residence', code, { shouldValidate: true, shouldDirty: true })}
          />
          {errors.country_of_residence && <p className="text-xs text-red-500 mt-1">{errors.country_of_residence.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            {...register('city')}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
            placeholder="Your city"
          />
          {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
        </div>
      </div>

      {/* Contact */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
        <input
          {...register('phone_number')}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
          placeholder="+1 234 567 8900"
        />
        {errors.phone_number && <p className="text-xs text-red-500 mt-1">{errors.phone_number.message}</p>}
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
        <textarea
          {...register('bio')}
          rows={3}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all resize-none"
          placeholder="A brief description about yourself (max 500 characters)"
          maxLength={500}
        />
        <div className="flex justify-between mt-1">
          {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
          <span className="text-xs text-slate-400 ml-auto">{(watch('bio') ?? '').length}/500</span>
        </div>
      </div>
    </div>
  );
}
