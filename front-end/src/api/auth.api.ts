import client from './client';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth.types';
import type { ApiResponse } from '../types/api.types';

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await client.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return res.data.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await client.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return res.data.data;
}

export async function refreshToken(): Promise<{ accessToken: string }> {
  const res = await client.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
  return res.data.data;
}

export async function logout(): Promise<void> {
  await client.post('/auth/logout');
}

export async function getMe(): Promise<User> {
  const res = await client.get<ApiResponse<User>>('/auth/me');
  return res.data.data;
}
