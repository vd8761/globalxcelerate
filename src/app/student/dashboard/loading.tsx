export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Greeting skeleton */}
        <div className="col-span-full flex items-center justify-between">
          <div>
            <div className="h-9 w-72 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
          <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse hidden sm:block" />
        </div>

        {/* Profile + GX Score */}
        <div className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="hidden lg:block h-48 bg-gray-200 rounded-2xl animate-pulse" />

        {/* Quick actions */}
        <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>

        {/* Recommendations + Applications */}
        <div className="lg:col-span-2 h-64 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />

        {/* Deadlines + Notifications */}
        <div className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="hidden lg:block h-48 bg-gray-200 rounded-2xl animate-pulse" />

        {/* Saved opportunities */}
        <div className="col-span-full h-44 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}
