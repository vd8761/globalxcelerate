export default function GXScoreLoading() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      {/* Header skeleton */}
      <div className="mb-8 flex items-center gap-6">
        <div className="h-28 w-28 rounded-full bg-slate-200 animate-pulse" />
        <div className="space-y-3">
          <div className="h-8 w-48 rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-5 w-64 rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-4 w-40 rounded-lg bg-slate-200 animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar chart skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="h-6 w-32 rounded bg-slate-200 animate-pulse mb-4" />
          <div className="h-72 w-full rounded-lg bg-slate-100 animate-pulse" />
        </div>

        {/* Dimension grid skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-40 rounded bg-slate-200 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl border border-slate-200 bg-white animate-pulse" />
            ))}
          </div>
        </div>

        {/* History chart skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="h-6 w-36 rounded bg-slate-200 animate-pulse mb-4" />
          <div className="h-48 w-full rounded-lg bg-slate-100 animate-pulse" />
        </div>

        {/* Recommendations skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-52 rounded bg-slate-200 animate-pulse" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border border-slate-200 bg-white animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
