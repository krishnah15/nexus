import client from './client';
import type { JobApplication, ScrapedJobData } from '../types/job.types';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';

export async function getJobs(params?: Record<string, string>): Promise<PaginatedResponse<JobApplication>> {
  const res = await client.get<PaginatedResponse<JobApplication>>('/jobs', { params });
  return res.data;
}

export async function getJob(id: string): Promise<JobApplication> {
  const res = await client.get<ApiResponse<JobApplication>>(`/jobs/${id}`);
  return res.data.data;
}

export async function createJob(data: Partial<JobApplication>): Promise<JobApplication> {
  const res = await client.post<ApiResponse<JobApplication>>('/jobs', data);
  return res.data.data;
}

export async function updateJob(id: string, data: Partial<JobApplication>): Promise<JobApplication> {
  const res = await client.patch<ApiResponse<JobApplication>>(`/jobs/${id}`, data);
  return res.data.data;
}

export async function deleteJob(id: string): Promise<void> {
  await client.delete(`/jobs/${id}`);
}

export async function scrapeJob(url: string): Promise<ScrapedJobData> {
  const res = await client.post<ApiResponse<ScrapedJobData>>('/jobs/scrape', { url });
  return res.data.data;
}
