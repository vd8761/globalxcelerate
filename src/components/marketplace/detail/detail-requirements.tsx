import { BookOpen, GraduationCap, Briefcase, Globe, Award } from 'lucide-react';
import type { OpportunityRequirements } from '@/types/marketplace';

interface DetailRequirementsProps {
  requirements: OpportunityRequirements;
}

export function DetailRequirements({ requirements }: DetailRequirementsProps) {
  const items = [];

  if (requirements.min_gpa) {
    items.push({ icon: GraduationCap, label: 'Minimum GPA', value: requirements.min_gpa.toString() });
  }
  if (requirements.degree_levels?.length) {
    items.push({ icon: Award, label: 'Degree Level', value: requirements.degree_levels.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ') });
  }
  if (requirements.fields_of_study?.length) {
    items.push({ icon: BookOpen, label: 'Fields of Study', value: requirements.fields_of_study.join(', ') });
  }
  if (requirements.min_experience_months) {
    items.push({ icon: Briefcase, label: 'Minimum Experience', value: `${requirements.min_experience_months} months` });
  }
  if (requirements.language_requirements?.length) {
    items.push({ icon: Globe, label: 'Languages', value: requirements.language_requirements.join(', ') });
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-500 italic">No specific requirements listed.</p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center border border-slate-100 flex-shrink-0">
            <item.icon className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{item.label}</p>
            <p className="text-sm text-slate-800 font-medium mt-0.5">{item.value}</p>
          </div>
        </div>
      ))}

      {requirements.required_skills?.length && (
        <div className="p-3 bg-slate-50 rounded-xl">
          <p className="text-xs text-slate-500 font-medium mb-2">Required Skills</p>
          <div className="flex flex-wrap gap-2">
            {requirements.required_skills.map((skill) => (
              <span key={skill} className="px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-100">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {requirements.preferred_skills?.length && (
        <div className="p-3 bg-slate-50 rounded-xl">
          <p className="text-xs text-slate-500 font-medium mb-2">Preferred Skills</p>
          <div className="flex flex-wrap gap-2">
            {requirements.preferred_skills.map((skill) => (
              <span key={skill} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
