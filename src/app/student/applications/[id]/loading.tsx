export default function ApplicationDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-48 bg-slate-100 rounded animate-pulse mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Opportunity card skeleton */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-3/4 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Timeline skeleton */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="h-5 w-32 bg-slate-100 rounded animate-pulse mb-4" />
            <div className="space-y-6 pl-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-slate-100 animate-pulse" />
                  <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Cover letter skeleton */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="h-5 w-28 bg-slate-100 rounded animate-pulse mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Match score skeleton */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-slate-100 animate-pulse" />
            </div>
            <div className="h-4 w-32 mx-auto bg-slate-100 rounded animate-pulse" />
          </div>

          {/* Documents skeleton */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="h-5 w-24 bg-slate-100 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 w-full bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>

          {/* Actions skeleton */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
