'use client';

import { Plus, X } from 'lucide-react';

interface OutcomesListProps {
  outcomes: string[];
  onChange: (outcomes: string[]) => void;
}

export function OutcomesList({ outcomes, onChange }: OutcomesListProps) {
  const addOutcome = () => {
    if (outcomes.length >= 10) return;
    onChange([...outcomes, '']);
  };

  const updateOutcome = (index: number, value: string) => {
    const updated = [...outcomes];
    updated[index] = value;
    onChange(updated);
  };

  const removeOutcome = (index: number) => {
    onChange(outcomes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">Key Outcomes / Achievements</label>
      {outcomes.map((outcome, index) => (
        <div key={index} className="flex gap-2">
          <input
            value={outcome}
            onChange={(e) => updateOutcome(index, e.target.value)}
            maxLength={200}
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
            placeholder="e.g., Improved model accuracy by 12%"
          />
          <button
            type="button"
            onClick={() => removeOutcome(index)}
            className="p-2 text-slate-400 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      {outcomes.length < 10 && (
        <button
          type="button"
          onClick={addOutcome}
          className="inline-flex items-center gap-1.5 text-sm text-cyan-600 hover:text-cyan-700 font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Add outcome
        </button>
      )}
    </div>
  );
}
