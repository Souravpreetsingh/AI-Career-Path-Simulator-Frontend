'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi, SendMessageDto } from '@/services/api/chat.api';

export function useChatHistory() {
  return useQuery({
    queryKey: ['chat-history'],
    queryFn: async () => {
      const res = await chatApi.getHistory();
      return res.data.data;
    },
  });
}

export function useChat(id: string) {
  return useQuery({
    queryKey: ['chat', id],
    queryFn: async () => {
      const res = await chatApi.getChatById(id);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: SendMessageDto) => {
      const res = await chatApi.sendMessage(dto);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    },
  });
}

export function useDeleteChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await chatApi.deleteChat(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    },
  });
}
