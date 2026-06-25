import axiosClient, { ApiResponse } from './axiosClient';

export const dashboardApi = {
  getStats: () =>
    axiosClient.get<ApiResponse<any>>('/dashboard/stats'),

  getActivity: () =>
    axiosClient.get<ApiResponse<any>>('/dashboard/activity'),

  getRecommendations: () =>
    axiosClient.get<ApiResponse<any[]>>('/dashboard/recommendations'),
};
