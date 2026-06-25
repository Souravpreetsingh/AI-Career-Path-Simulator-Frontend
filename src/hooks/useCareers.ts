'use client';

import { useQuery } from '@tanstack/react-query';
import { careerApi } from '@/services/api/career.api';

export function useCareerList(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['careers', params],
    queryFn: async () => {
      const res = await careerApi.findAll(params);
      return res.data.data;
    },
  });
}

export function useCareer(id: string) {
  return useQuery({
    queryKey: ['career', id],
    queryFn: async () => {
      const res = await careerApi.findById(id);
      return res.data.data;
    },
    enabled: !!id,
  });
}
