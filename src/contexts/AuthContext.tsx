'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, AuthResult } from '@/services/api/auth.api';

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  provider: string;
  collegeName?: string;
  course?: string;
  graduationYear?: number;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (dto: { fullName: string; email: string; password: string; collegeName?: string; course?: string; graduationYear?: number }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  const storeAuth = useCallback((result: AuthResult) => {
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    localStorage.setItem('user', JSON.stringify(result.user));
    setToken(result.accessToken);
    setUser(result.user);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        clearAuth();
      }
    }
    setIsLoading(false);
  }, [clearAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    storeAuth(res.data.data);
  }, [storeAuth]);

  const signup = useCallback(async (dto: { fullName: string; email: string; password: string; collegeName?: string; course?: string; graduationYear?: number }) => {
    const res = await authApi.signup(dto);
    storeAuth(res.data.data);
  }, [storeAuth]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    clearAuth();
  }, [clearAuth]);

  const updateUser = useCallback((updatedUser: User) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
