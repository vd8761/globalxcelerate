'use client';

import { useOnboardingStore } from '@/stores/onboarding-store';
import { User } from 'lucide-react';

export function ProfileSummaryCard() {
  const identity = useOnboardingStore((s) => s.identity);
  const skills = useOnboardingStore((s) => s.skills);
  const education = useOnboardingStore((s) => s.education);

  const topSkills = skills.skills.slice(0, 5);
  const primaryEducation = education.entries[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-md p-5">
      <div className="flex items-center gap-4">
        {identity.profile_photo_url ? (
          <img
            src={identity.profile_photo_url}
            alt="Profile"
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
            <User className="w-6 h-6 text-slate-400" />
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            {identity.first_name} {identity.last_name}
          </h3>
          {primaryEducation && (
            <p className="text-sm text-slate-500">
              {primaryEducation.field_of_study} at {primaryEducation.institution_name}
            </p>
          )}
          {identity.city && identity.country_of_residence && (
            <p className="text-xs text-slate-400 mt-0.5">
              📍 {identity.city}
            </p>
          )}
        </div>
      </div>

      {topSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {topSkills.map((skill) => (
            <span key={skill.id} className="px-2 py-0.5 bg-cyan-50 text-cyan-700 text-xs font-medium rounded-full">
              {skill.skill_name}
            </span>
          ))}
          {skills.skills.length > 5 && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">
              +{skills.skills.length - 5} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
