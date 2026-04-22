import client from './client';
import type { ApiResponse } from '../types/api.types';

export interface DashboardOverview {
  jobs: { total: number; byStatus: Array<{ status: string; _count: number }>; recent: Array<{ id: string; company: string; position: string; status: string; createdAt: string }> };
  learning: { total: number; byStatus: Array<{ status: string; _count: number }>; recent: Array<{ id: string; title: string; category: string; status: string; progress: number; updatedAt: string }> };
  dsa: { total: number; byStatus: Array<{ status: string; _count: number }> };
  countries: { total: number };
}

export interface FunnelData {
  stage: string;
  count: number;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const res = await client.get<ApiResponse<DashboardOverview>>('/dashboard/overview');
  return res.data.data;
}

export async function getJobsFunnel(): Promise<FunnelData[]> {
  const res = await client.get<ApiResponse<FunnelData[]>>('/dashboard/jobs-funnel');
  return res.data.data;
}

export async function getLearningProgress(): Promise<Record<string, { total: number; avgProgress: number; completed: number }>> {
  const res = await client.get<ApiResponse<Record<string, { total: number; avgProgress: number; completed: number }>>>('/dashboard/learning-progress');
  return res.data.data;
}
