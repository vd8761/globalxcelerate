export function OpportunityCardSkeleton() {
  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-2xl p-5 min-h-[280px] animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-200 rounded w-24" />
          <div className="h-4 bg-slate-200 rounded w-full" />
        </div>
      </div>
      <div className="flex gap-2 mb-3">
        <div className="h-4 bg-slate-100 rounded w-32" />
        <div className="h-4 bg-slate-100 rounded w-16" />
      </div>
      <div className="h-6 bg-slate-100 rounded-full w-24 mb-3" />
      <div className="flex gap-2 mb-3">
        <div className="h-3 bg-slate-100 rounded w-20" />
        <div className="h-3 bg-slate-100 rounded w-28" />
      </div>
      <div className="flex gap-1.5 mb-3">
        <div className="h-5 bg-slate-100 rounded-full w-16" />
        <div className="h-5 bg-slate-100 rounded-full w-14" />
        <div className="h-5 bg-slate-100 rounded-full w-18" />
      </div>
      <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between">
        <div className="h-3 bg-slate-100 rounded w-24" />
        <div className="w-9 h-9 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}
