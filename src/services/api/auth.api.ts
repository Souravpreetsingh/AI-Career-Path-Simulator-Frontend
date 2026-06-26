import axiosClient, { ApiResponse } from './axiosClient';

export interface LoginDto {
  email: string;
  password: string;
}

export interface SignupDto {
  fullName: string;
  email: string;
  password: string;
  collegeName?: string;
  course?: string;
  graduationYear?: number;
}

export interface AuthResult {
  user: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    provider: string;
    collegeName?: string;
    course?: string;
    graduationYear?: number;
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  signup: (dto: SignupDto) =>
    axiosClient.post<ApiResponse<AuthResult>>('/auth/signup', dto),

  login: (dto: LoginDto) =>
    axiosClient.post<ApiResponse<AuthResult>>('/auth/login', dto),

  googleLogin: (dto: { googleId: string; email: string; fullName: string; avatar?: string }) =>
    axiosClient.post<ApiResponse<AuthResult>>('/auth/google', dto),

  refreshToken: (refreshToken: string) =>
    axiosClient.post<ApiResponse<AuthResult>>('/auth/refresh', { refreshToken }),

  logout: () =>
    axiosClient.post<ApiResponse<null>>('/auth/logout'),

  getMe: () =>
    axiosClient.get<ApiResponse<any>>('/auth/me'),

  changePassword: (dto: { currentPassword: string; newPassword: string }) =>
    axiosClient.post<ApiResponse<null>>('/auth/change-password', dto),

  forgotPassword: (email: string) =>
    axiosClient.post<ApiResponse<null>>('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    axiosClient.post<ApiResponse<null>>('/auth/reset-password', { token, newPassword }),

  guest: () =>
    axiosClient.post<ApiResponse<AuthResult>>('/auth/guest'),

  getProfile: () =>
    axiosClient.get<ApiResponse<any>>('/auth/profile'),
};
