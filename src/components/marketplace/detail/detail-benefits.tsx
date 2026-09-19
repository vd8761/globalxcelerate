import { DollarSign, Home, Plane, BookOpen, Users, Award } from 'lucide-react';
import type { Benefit } from '@/types/marketplace';

interface DetailBenefitsProps {
  benefits: Benefit[];
}

const BENEFIT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  compensation: DollarSign,
  housing: Home,
  travel: Plane,
  learning: BookOpen,
  networking: Users,
  default: Award,
};

export function DetailBenefits({ benefits }: DetailBenefitsProps) {
  if (!benefits || benefits.length === 0) {
    return <p className="text-sm text-slate-500 italic">No specific benefits listed.</p>;
  }

  return (
    <div className="space-y-3">
      {benefits.map((benefit, idx) => {
        const Icon = BENEFIT_ICONS[benefit.type] || BENEFIT_ICONS.default;
        return (
          <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium capitalize">{benefit.type}</p>
              <p className="text-sm text-slate-800 mt-0.5">{benefit.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
