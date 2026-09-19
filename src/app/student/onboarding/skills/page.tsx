'use client';

import { useEffect, useState } from 'react';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { useAutoSave } from '@/hooks/onboarding/useAutoSave';
import { useStepNavigation } from '@/hooks/onboarding/useStepNavigation';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { NavigationFooter } from '@/components/onboarding/NavigationFooter';
import { SkillSearch } from '@/components/onboarding/skills/SkillSearch';
import { SelectedSkillsList } from '@/components/onboarding/skills/SelectedSkillsList';
import { CustomSkillInput } from '@/components/onboarding/skills/CustomSkillInput';
import { SkillCategoryFilter } from '@/components/onboarding/skills/SkillCategoryFilter';
import { MIN_SKILLS } from '@/lib/onboarding/constants';
import type { SkillEntry, SkillCategoryEnum } from '@/lib/onboarding/types';

export default function SkillsPage() {
  const skills = useOnboardingStore((s) => s.skills);
  const setStepData = useOnboardingStore((s) => s.setStepData);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);
  const [selectedSkills, setSelectedSkills] = useState<SkillEntry[]>(skills.skills);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { setCurrentStep(3); }, [setCurrentStep]);
  useEffect(() => {
    if (skills.skills.length > 0 && selectedSkills.length === 0) setSelectedSkills(skills.skills);
  }, [skills.skills]);

  const formData = { skills: selectedSkills };
  useAutoSave('skills', formData, selectedSkills.length > 0);

  useEffect(() => {
    setStepData('skills', { skills: selectedSkills });
  }, [selectedSkills, setStepData]);

  const { goToNext, goBack, isNavigating } = useStepNavigation(3);

  const handleSelectSkill = (skill: { id: string; name: string; category: string }) => {
    if (selectedSkills.some((s) => s.skill_id === skill.id || s.skill_name.toLowerCase() === skill.name.toLowerCase())) return;
    const newSkill: SkillEntry = {
      id: crypto.randomUUID(),
      skill_id: skill.id,
      skill_name: skill.name,
      category: (skill.category || 'technical') as SkillCategoryEnum,
      proficiency: 3,
      is_custom: false,
      is_verified: true,
      source: 'catalog',
      display_order: selectedSkills.length,
    };
    setSelectedSkills([...selectedSkills, newSkill]);
  };

  const handleAddCustom = (name: string, category: SkillCategoryEnum) => {
    const newSkill: SkillEntry = {
      id: crypto.randomUUID(),
      skill_id: null,
      skill_name: name,
      category,
      proficiency: 3,
      is_custom: true,
      is_verified: false,
      source: 'user_submitted',
      display_order: selectedSkills.length,
    };
    setSelectedSkills([...selectedSkills, newSkill]);
  };

  const handleRemove = (id: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s.id !== id));
  };

  const handleUpdateProficiency = (id: string, proficiency: number) => {
    setSelectedSkills(selectedSkills.map((s) => (s.id === id ? { ...s, proficiency } : s)));
  };

  const handleNext = async () => {
    if (selectedSkills.length < MIN_SKILLS) return;
    setIsSubmitting(true);
    await goToNext({ skills: selectedSkills });
    setIsSubmitting(false);
  };

  return (
    <OnboardingShell title="Skills" subtitle="Showcase your abilities and expertise">
      <div className="space-y-6">
        {/* Minimum indicator */}
        <div className={`text-sm font-medium ${selectedSkills.length >= MIN_SKILLS ? 'text-emerald-600' : 'text-slate-500'}`}>
          {selectedSkills.length} of {MIN_SKILLS} minimum skills selected
          {selectedSkills.length >= MIN_SKILLS && ' ✓'}
        </div>

        {/* Search */}
        <SkillSearch
          onSelectSkill={handleSelectSkill}
          excludeIds={selectedSkills.map((s) => s.skill_id).filter(Boolean) as string[]}
        />

        {/* Custom skill */}
        <CustomSkillInput
          onAdd={handleAddCustom}
          existingNames={selectedSkills.map((s) => s.skill_name)}
        />

        {/* Selected */}
        {selectedSkills.length > 0 && (
          <SelectedSkillsList
            skills={selectedSkills}
            onUpdateProficiency={handleUpdateProficiency}
            onRemove={handleRemove}
          />
        )}

        {selectedSkills.length >= 3 && selectedSkills.length < 8 && (
          <p className="text-xs text-slate-400 text-center">💡 Tip: Adding 8-15 skills improves your match accuracy</p>
        )}
      </div>

      <NavigationFooter
        onBack={goBack}
        onNext={handleNext}
        isLoading={isSubmitting || isNavigating}
        isNextDisabled={selectedSkills.length < MIN_SKILLS}
      />
    </OnboardingShell>
  );
}
