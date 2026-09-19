'use client';

import { useQuery } from '@tanstack/react-query';
import type { DashboardData } from '@/types/dashboard';
import { DASHBOARD_REFRESH_INTERVAL } from '@/lib/dashboard/constants';

async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch('/api/v1/students/dashboard', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Dashboard fetch failed: ${response.status}`);
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.error?.message || 'Failed to load dashboard data');
  }

  return json.data;
}

export function useDashboardData() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard-data'],
    queryFn: fetchDashboardData,
    staleTime: 30000,
    refetchInterval: DASHBOARD_REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
  });
}
