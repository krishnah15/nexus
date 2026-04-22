import client from './client';
import type { LearningItem } from '../types/learning.types';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';

export async function getLearningItems(params?: Record<string, string>): Promise<PaginatedResponse<LearningItem>> {
  const res = await client.get<PaginatedResponse<LearningItem>>('/learning', { params });
  return res.data;
}

export async function createLearningItem(data: Partial<LearningItem>): Promise<LearningItem> {
  const res = await client.post<ApiResponse<LearningItem>>('/learning', data);
  return res.data.data;
}

export async function updateLearningItem(id: string, data: Partial<LearningItem>): Promise<LearningItem> {
  const res = await client.patch<ApiResponse<LearningItem>>(`/learning/${id}`, data);
  return res.data.data;
}

export async function deleteLearningItem(id: string): Promise<void> {
  await client.delete(`/learning/${id}`);
}
