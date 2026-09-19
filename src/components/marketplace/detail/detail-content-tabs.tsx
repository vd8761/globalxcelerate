'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DetailDescription } from './detail-description';
import { DetailRequirements } from './detail-requirements';
import { DetailBenefits } from './detail-benefits';
import { DetailSkillsList } from './detail-skills-list';
import type { OpportunityRequirements, Benefit, ApplicationField, OpportunitySkill } from '@/types/marketplace';

interface DetailContentTabsProps {
  description: string;
  requirements: OpportunityRequirements;
  benefits: Benefit[];
  responsibilities: string[];
  application_fields: ApplicationField[];
  skills: OpportunitySkill[];
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'benefits', label: 'Benefits' },
  { id: 'skills', label: 'Skills' },
] as const;

export function DetailContentTabs({
  description, requirements, benefits, responsibilities, application_fields, skills
}: DetailContentTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-slate-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-cyan-500 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[300px]">
        {activeTab === 'overview' && (
          <DetailDescription
            description={description}
            responsibilities={responsibilities}
          />
        )}
        {activeTab === 'requirements' && (
          <DetailRequirements requirements={requirements} />
        )}
        {activeTab === 'benefits' && (
          <DetailBenefits benefits={benefits} />
        )}
        {activeTab === 'skills' && (
          <DetailSkillsList skills={skills} />
        )}
      </div>
    </div>
  );
}
