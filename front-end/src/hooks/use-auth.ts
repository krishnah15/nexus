import { useCallback, useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';
import * as authApi from '../api/auth.api';
import type { LoginRequest, RegisterRequest } from '../types/auth.types';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !user) {
      authApi.getMe()
        .then((u) => setUser(u, token))
        .catch(() => clearAuth());
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const result = await authApi.login(data);
    setUser(result.user, result.accessToken);
    return result;
  }, [setUser]);

  const register = useCallback(async (data: RegisterRequest) => {
    const result = await authApi.register(data);
    setUser(result.user, result.accessToken);
    return result;
  }, [setUser]);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    clearAuth();
  }, [clearAuth]);

  return { user, isAuthenticated, isLoading, login, register, logout };
}
