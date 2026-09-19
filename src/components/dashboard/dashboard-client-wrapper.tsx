'use client';

import { useDashboardData } from '@/hooks/dashboard';
import { RecommendedOpportunities } from './recommended-opportunities';
import { ApplicationsSummary } from './applications-summary';
import { DeadlinesWidget } from './deadlines-widget';
import { NotificationsFeed } from './notifications-feed';
import { SavedOpportunities } from './saved-opportunities';

export function DashboardClientWrapper() {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <>
        <div className="lg:col-span-2 h-64 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="col-span-full h-44 bg-gray-100 rounded-2xl animate-pulse" />
      </>
    );
  }

  if (error || !data) {
    return (
      <div className="col-span-full bg-white rounded-2xl shadow-sm border border-red-100 p-6 text-center">
        <p className="text-sm text-red-600">Failed to load dashboard data. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <>
      {/* Recommendations — 2/3 width, Applications — 1/3 width */}
      <div className="lg:col-span-2">
        <RecommendedOpportunities recommendations={data.recommendations} />
      </div>
      <div>
        <ApplicationsSummary applications={data.applications} />
      </div>

      {/* Deadlines + Notifications side by side */}
      <div className="md:col-span-1">
        <DeadlinesWidget deadlines={data.deadlines} />
      </div>
      <div className="md:col-span-1 lg:col-span-2">
        <NotificationsFeed notifications={data.notifications} />
      </div>

      {/* Saved opportunities — full width */}
      <SavedOpportunities savedOpportunities={data.savedOpportunities} />
    </>
  );
}
