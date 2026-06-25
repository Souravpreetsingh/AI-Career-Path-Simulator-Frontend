import axiosClient, { ApiResponse } from './axiosClient';

export interface SaveRoadmapDto {
  careerId: string;
  phases?: string[];
  progress?: number;
  completedSteps?: string[];
}

export const roadmapApi = {
  findAll: () =>
    axiosClient.get<ApiResponse<any[]>>('/roadmaps'),

  findById: (id: string) =>
    axiosClient.get<ApiResponse<any>>(`/roadmaps/${id}`),

  save: (dto: SaveRoadmapDto) =>
    axiosClient.post<ApiResponse<any>>('/roadmaps/save', dto),
};
