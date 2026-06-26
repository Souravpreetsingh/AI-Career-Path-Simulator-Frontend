import axiosClient, { ApiResponse, PaginatedData } from './axiosClient';

export const careerApi = {
  findAll: (params?: { page?: number; limit?: number; search?: string }) =>
    axiosClient.get<ApiResponse<PaginatedData<any>>>('/careers', { params }),

  findById: (id: string) =>
    axiosClient.get<ApiResponse<any>>(`/careers/${id}`),

  findByTitle: (title: string) =>
    axiosClient.get<ApiResponse<any>>(`/careers/by-title/${encodeURIComponent(title)}`),
};
