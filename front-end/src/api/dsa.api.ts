import client from './client';
import type { DsaProblem, DsaStats } from '../types/dsa.types';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';

export async function getDsaProblems(params?: Record<string, string>): Promise<PaginatedResponse<DsaProblem>> {
  const res = await client.get<PaginatedResponse<DsaProblem>>('/dsa', { params });
  return res.data;
}

export async function createDsaProblem(data: Partial<DsaProblem>): Promise<DsaProblem> {
  const res = await client.post<ApiResponse<DsaProblem>>('/dsa', data);
  return res.data.data;
}

export async function updateDsaProblem(id: string, data: Partial<DsaProblem>): Promise<DsaProblem> {
  const res = await client.patch<ApiResponse<DsaProblem>>(`/dsa/${id}`, data);
  return res.data.data;
}

export async function deleteDsaProblem(id: string): Promise<void> {
  await client.delete(`/dsa/${id}`);
}

export async function getDsaStats(): Promise<DsaStats> {
  const res = await client.get<ApiResponse<DsaStats>>('/dsa/stats');
  return res.data.data;
}
