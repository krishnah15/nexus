import client from './client';
import type { ApiResponse } from '../types/api.types';
import type { SkillProfile, MatchingJobsResponse } from '../types/ats.types';

export async function extractSkillProfile(documentId: string): Promise<SkillProfile> {
  const res = await client.post<ApiResponse<SkillProfile>>('/job-matching/skills', { documentId });
  return res.data.data;
}

export async function getSkillProfile(): Promise<SkillProfile | null> {
  const res = await client.get<ApiResponse<SkillProfile | null>>('/job-matching/skills');
  return res.data.data;
}

export async function deleteSkillProfile(): Promise<void> {
  await client.delete('/job-matching/skills');
}

export async function getSuggestedRoles(country = 'in'): Promise<{ role: string; count: number }[]> {
  const res = await client.get<ApiResponse<{ role: string; count: number }[]>>('/job-matching/roles', { params: { country } });
  return res.data.data;
}

export async function getMatchingJobs(params?: {
  location?: string;
  country?: string;
  page?: string;
  minMatch?: string;
}): Promise<MatchingJobsResponse> {
  const res = await client.get<ApiResponse<MatchingJobsResponse>>('/job-matching/jobs', { params });
  return res.data.data;
}
