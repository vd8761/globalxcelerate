'use client';

interface ApplyCoverLetterProps {
  value: string;
  onChange: (value: string) => void;
}

export function ApplyCoverLetter({ value, onChange }: ApplyCoverLetterProps) {
  const maxLength = 5000;

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Cover Letter <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Tell the employer why you're interested in this opportunity and what relevant experience you have.
        </p>
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder="I'm excited about this opportunity because..."
          rows={12}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none"
        />
        <span className="absolute bottom-3 right-3 text-xs text-slate-400">
          {value.length}/{maxLength}
        </span>
      </div>

      <div className="bg-slate-50 rounded-lg p-3">
        <p className="text-xs text-slate-500 font-medium mb-1">Tips:</p>
        <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
          <li>Explain your motivation for applying</li>
          <li>Highlight relevant skills and experiences</li>
          <li>Mention how this aligns with your career goals</li>
        </ul>
      </div>
    </div>
  );
}
