import axiosClient, { ApiResponse, PaginatedData } from './axiosClient';

export interface AnalyzeDto {
  selectedSkills: string[];
  interests: string;
  careerGoal?: string;
  strengths?: string[];
  weaknesses?: string[];
  assessmentId?: string;
}

export const recommendationApi = {
  analyze: (dto: AnalyzeDto) =>
    axiosClient.post<ApiResponse<any>>('/recommendations/analyze', dto),

  getHistory: (params?: { page?: number; limit?: number; search?: string; minMatch?: number; sort?: string; order?: string }) =>
    axiosClient.get<ApiResponse<PaginatedData<any>>>('/recommendations/history', { params }),

  getById: (id: string) =>
    axiosClient.get<ApiResponse<any>>(`/recommendations/history/${id}`),

  getCareers: (search?: string) =>
    axiosClient.get<ApiResponse<any[]>>('/recommendations/careers', { params: { search } }),

  getPrompts: () =>
    axiosClient.get<ApiResponse<string[]>>('/recommendations/prompts'),
};
