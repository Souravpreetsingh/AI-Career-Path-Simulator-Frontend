'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roadmapApi, SaveRoadmapDto } from '@/services/api/roadmap.api';

export function useRoadmaps() {
  return useQuery({
    queryKey: ['roadmaps'],
    queryFn: async () => {
      const res = await roadmapApi.findAll();
      return res.data.data;
    },
  });
}

export function useRoadmap(id: string) {
  return useQuery({
    queryKey: ['roadmap', id],
    queryFn: async () => {
      const res = await roadmapApi.findById(id);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useSaveRoadmap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: SaveRoadmapDto) => {
      const res = await roadmapApi.save(dto);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
    },
  });
}
