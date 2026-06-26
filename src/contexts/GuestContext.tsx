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
  signup: (dto: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function GuestProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  const storeAuth = useCallback((result: AuthResult) => {
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('user', JSON.stringify(result.user));
    setToken(result.accessToken);
    setUser(result.user);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      try { setUser(JSON.parse(storedUser)); } catch { clearAuth(); }
      setIsLoading(false);
    } else {
      authApi.guest()
        .then((res) => { storeAuth(res.data.data); })
        .catch(() => { /* offline fallback */ })
        .finally(() => setIsLoading(false));
    }
  }, []);

  const login = useCallback(async () => { /* no-op — already auto-authenticated */ }, []);
  const signup = useCallback(async () => { /* no-op */ }, []);

  const logout = useCallback(async () => {
    clearAuth();
    try {
      const res = await authApi.guest();
      storeAuth(res.data.data);
    } catch { /* ignore */ }
  }, [clearAuth, storeAuth]);

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
  if (!ctx) throw new Error('useAuth must be used within GuestProvider');
  return ctx;
}
