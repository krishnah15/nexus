import client from './client';
import type { Country, Pathway } from '../types/country.types';
import type { ApiResponse } from '../types/api.types';

export async function getCountries(): Promise<Country[]> {
  const res = await client.get<ApiResponse<Country[]>>('/countries');
  return res.data.data;
}

export async function getCountry(id: string): Promise<Country> {
  const res = await client.get<ApiResponse<Country>>(`/countries/${id}`);
  return res.data.data;
}

export async function createCountry(data: Partial<Country>): Promise<Country> {
  const res = await client.post<ApiResponse<Country>>('/countries', data);
  return res.data.data;
}

export async function updateCountry(id: string, data: Partial<Country>): Promise<Country> {
  const res = await client.patch<ApiResponse<Country>>(`/countries/${id}`, data);
  return res.data.data;
}

export async function deleteCountry(id: string): Promise<void> {
  await client.delete(`/countries/${id}`);
}

export async function createPathway(countryId: string, data: Partial<Pathway>): Promise<Pathway> {
  const res = await client.post<ApiResponse<Pathway>>(`/countries/${countryId}/pathways`, data);
  return res.data.data;
}

export async function updatePathway(countryId: string, id: string, data: Partial<Pathway>): Promise<Pathway> {
  const res = await client.patch<ApiResponse<Pathway>>(`/countries/${countryId}/pathways/${id}`, data);
  return res.data.data;
}

export async function deletePathway(countryId: string, id: string): Promise<void> {
  await client.delete(`/countries/${countryId}/pathways/${id}`);
}
