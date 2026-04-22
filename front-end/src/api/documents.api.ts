import client from './client';
import type { DocumentItem } from '../types/country.types';
import type { ApiResponse } from '../types/api.types';

export async function getDocuments(params?: Record<string, string>): Promise<DocumentItem[]> {
  const res = await client.get<ApiResponse<DocumentItem[]>>('/documents', { params });
  return res.data.data;
}

export async function uploadDocument(formData: FormData): Promise<DocumentItem> {
  const res = await client.post<ApiResponse<DocumentItem>>('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function deleteDocument(id: string): Promise<void> {
  await client.delete(`/documents/${id}`);
}

export function getDownloadUrl(id: string): string {
  return `/api/v1/documents/${id}/download`;
}
