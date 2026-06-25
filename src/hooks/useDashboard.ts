'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api/dashboard.api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await dashboardApi.getStats();
      return res.data.data;
    },
  });
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: async () => {
      const res = await dashboardApi.getActivity();
      return res.data.data;
    },
  });
}

export function useDashboardRecommendations() {
  return useQuery({
    queryKey: ['dashboard-recommendations'],
    queryFn: async () => {
      const res = await dashboardApi.getRecommendations();
      return res.data.data;
    },
  });
}
