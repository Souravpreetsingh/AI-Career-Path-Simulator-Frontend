'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentApi, CreateAssessmentDto } from '@/services/api/assessment.api';

export function useAssessmentResults() {
  return useQuery({
    queryKey: ['assessment-results'],
    queryFn: async () => {
      const res = await assessmentApi.findResults();
      return res.data.data;
    },
  });
}

export function useAssessment(id: string) {
  return useQuery({
    queryKey: ['assessment', id],
    queryFn: async () => {
      const res = await assessmentApi.findById(id);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateAssessmentDto) => {
      const res = await assessmentApi.create(dto);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-results'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}
