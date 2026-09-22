import Link from 'next/link';

interface ProfileCompletionWidgetProps {
  completionPercentage: number;
}

export function ProfileCompletionWidget({ completionPercentage }: ProfileCompletionWidgetProps) {
  const isComplete = completionPercentage >= 100;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Profile Completion
        </p>
        <p className="text-3xl font-bold text-slate-900 mt-2">
          {completionPercentage}%
        </p>
      </div>

      <div className="mt-4">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(completionPercentage, 100)}%` }}
          />
        </div>

        <div className="mt-3">
          {isComplete ? (
            <p className="text-sm text-green-600 font-medium">🎉 Profile complete!</p>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                Complete your profile to unlock more opportunities
              </p>
              <Link
                href="/student/profile"
                className="inline-block mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Complete Profile →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
