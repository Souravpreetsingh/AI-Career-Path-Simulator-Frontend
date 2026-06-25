import axiosClient, { ApiResponse } from './axiosClient';

export interface UpdateProfileDto {
  fullName?: string;
  collegeName?: string;
  course?: string;
  graduationYear?: number;
  avatar?: string;
}

export const userApi = {
  getProfile: () =>
    axiosClient.get<ApiResponse<any>>('/users/profile'),

  updateProfile: (dto: UpdateProfileDto) =>
    axiosClient.patch<ApiResponse<any>>('/users/profile', dto),

  deleteProfile: () =>
    axiosClient.delete<ApiResponse<null>>('/users/profile'),
};
