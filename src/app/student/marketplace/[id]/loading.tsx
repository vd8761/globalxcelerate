export default function DetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="h-4 bg-slate-200 rounded w-48 mb-6 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-32 animate-pulse" />
                <div className="h-3 bg-slate-100 rounded w-20 animate-pulse" />
              </div>
            </div>
            <div className="h-8 bg-slate-200 rounded w-3/4 animate-pulse" />
            <div className="flex gap-3">
              <div className="h-5 bg-slate-100 rounded w-28 animate-pulse" />
              <div className="h-5 bg-slate-100 rounded w-24 animate-pulse" />
              <div className="h-5 bg-slate-100 rounded w-20 animate-pulse" />
            </div>
          </div>
          <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-44 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-48 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
