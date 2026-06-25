import axiosClient, { ApiResponse } from './axiosClient';

export interface SendMessageDto {
  message: string;
  chatId?: string;
}

export const chatApi = {
  sendMessage: (dto: SendMessageDto) =>
    axiosClient.post<ApiResponse<any>>('/chat/message', dto),

  getHistory: () =>
    axiosClient.get<ApiResponse<any[]>>('/chat/history'),

  getChatById: (id: string) =>
    axiosClient.get<ApiResponse<any>>(`/chat/${id}`),

  deleteChat: (id: string) =>
    axiosClient.delete<ApiResponse<null>>(`/chat/${id}`),
};
