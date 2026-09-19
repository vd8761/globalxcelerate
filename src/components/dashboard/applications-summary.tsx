import Link from 'next/link';
import { APPLICATION_STAGES, STAGE_DOT_COLORS } from '@/lib/dashboard/constants';
import type { ApplicationCounts } from '@/types/dashboard';

interface ApplicationsSummaryProps {
  applications: ApplicationCounts;
}

export function ApplicationsSummary({ applications }: ApplicationsSummaryProps) {
  const hasAny = applications.total > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Applications</h2>
        {hasAny && (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
            {applications.total}
          </span>
        )}
      </div>

      {!hasAny ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <p className="text-sm text-gray-500 mb-3">No applications yet</p>
          <Link
            href="/student/marketplace"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Browse Opportunities →
          </Link>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-0">
            {APPLICATION_STAGES.map((stage) => {
              const count = applications[stage.key as keyof ApplicationCounts] ?? 0;
              return (
                <div
                  key={stage.key}
                  className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${STAGE_DOT_COLORS[stage.color]}`} />
                    <span className="text-sm text-gray-600">{stage.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <Link
              href="/student/applications"
              className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              View All Applications →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
