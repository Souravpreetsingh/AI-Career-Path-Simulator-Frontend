'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recommendationApi, AnalyzeDto } from '@/services/api/recommendation.api';

export function useAnalyze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: AnalyzeDto) => {
      const res = await recommendationApi.analyze(dto);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendation-history'] });
    },
  });
}

export function useRecommendationHistory(params?: { page?: number; limit?: number; minMatch?: number }) {
  return useQuery({
    queryKey: ['recommendation-history', params],
    queryFn: async () => {
      const res = await recommendationApi.getHistory(params);
      return res.data.data;
    },
  });
}

export function useRecommendation(id: string) {
  return useQuery({
    queryKey: ['recommendation', id],
    queryFn: async () => {
      const res = await recommendationApi.getById(id);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useRecommendedCareers(search?: string) {
  return useQuery({
    queryKey: ['recommended-careers', search],
    queryFn: async () => {
      const res = await recommendationApi.getCareers(search);
      return res.data.data;
    },
  });
}

export function usePrompts() {
  return useQuery({
    queryKey: ['prompts'],
    queryFn: async () => {
      const res = await recommendationApi.getPrompts();
      return res.data.data;
    },
  });
}
