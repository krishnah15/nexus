import client from './client';
import type { ApiResponse } from '../types/api.types';
import type { AtsCheckResult } from '../types/ats.types';

export async function checkAtsScore(data: { documentId: string; jobDescription: string }): Promise<AtsCheckResult> {
  const res = await client.post<ApiResponse<AtsCheckResult>>('/ats', data);
  return res.data.data;
}

export async function getAtsHistory(): Promise<AtsCheckResult[]> {
  const res = await client.get<ApiResponse<AtsCheckResult[]>>('/ats');
  return res.data.data;
}

export async function getAtsCheck(id: string): Promise<AtsCheckResult> {
  const res = await client.get<ApiResponse<AtsCheckResult>>(`/ats/${id}`);
  return res.data.data;
}

export async function deleteAtsCheck(id: string): Promise<void> {
  await client.delete(`/ats/${id}`);
}
