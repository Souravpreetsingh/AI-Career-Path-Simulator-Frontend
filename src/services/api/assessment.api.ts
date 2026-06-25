import axiosClient, { ApiResponse } from './axiosClient';

export interface CreateAssessmentDto {
  selectedSkills: string[];
  interests: string;
  careerGoals?: string;
  strengths?: string[];
  weaknesses?: string[];
}

export const assessmentApi = {
  create: (dto: CreateAssessmentDto) =>
    axiosClient.post<ApiResponse<any>>('/assessment/create', dto),

  findById: (id: string) =>
    axiosClient.get<ApiResponse<any>>(`/assessment/${id}`),

  findResults: () =>
    axiosClient.get<ApiResponse<any>>('/assessment/results'),
};
