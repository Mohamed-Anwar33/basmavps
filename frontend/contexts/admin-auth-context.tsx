'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

interface Admin {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  lastLogin?: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  token: string | null;
  redirectToLogin: () => void;
  showSessionExpired: boolean;
  setShowSessionExpired: (show: boolean) => void;
  showDataLoadError: boolean;
  setShowDataLoadError: (show: boolean) => void;
  dataLoadErrorMessage: string;
  setDataLoadErrorMessage: (message: string) => void;
  handleApiError: (error: any, context?: string) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [showDataLoadError, setShowDataLoadError] = useState(false);
  const [dataLoadErrorMessage, setDataLoadErrorMessage] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!admin && !!token;

  useEffect(() => {
    // Only check auth on initial load
    if (loading) {
      checkAdminAuth();
    }
  }, []);

  useEffect(() => {
    // Set up periodic session check every 5 minutes, but only if authenticated
    if (isAuthenticated && pathname.startsWith('/admin') && pathname !== '/admin/login') {
      const sessionCheckInterval = setInterval(() => {
        checkAdminAuth();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(sessionCheckInterval);
    }
  }, [isAuthenticated, pathname]);

  const checkAdminAuth = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        setLoading(false);
        // Don't auto-redirect - let pages handle their own redirects
        return;
      }

      setToken(adminToken);

      // Verify admin token with backend
      const response = await apiFetch('/admin/me', {
        auth: true
      });

      if (response && (response as any).success && (response as any).data?.admin) {
        setAdmin((response as any).data.admin);
      } else {
        // Token is invalid or response is null
        handleSessionExpired();
      }
    } catch (error) {
      // Check if it's a 401 (unauthorized) error - session expired
      if ((error as any)?.status === 401 || (error as any)?.message?.includes('401')) {
        handleSessionExpired();
      } else {
        // Other errors - just clear auth without redirect
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRefreshToken');
        setToken(null);
        setAdmin(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSessionExpired = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    setToken(null);
    setAdmin(null);
    
    // Show session expired modal only if user is on admin pages (not login)
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      setShowSessionExpired(true);
    } else {
      // Just redirect if on login page
      setTimeout(() => router.push('/admin/login'), 100);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      
      const response = await apiFetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        auth: false
      });

      // Login successful

      if ((response as any).success && (response as any).data?.token) {
        const adminToken = (response as any).data.token;
        const adminRefreshToken = (response as any).data.refreshToken;
        localStorage.setItem('adminToken', adminToken);
        if (adminRefreshToken) localStorage.setItem('adminRefreshToken', adminRefreshToken);
        setToken(adminToken);
        setAdmin((response as any).data.admin);
        setLoading(false);
        
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    setAdmin(null);
    setToken(null);
    router.push('/admin/login');
  };

  const redirectToLogin = () => {
    router.push('/admin/login');
  };

  const handleApiError = (error: any, context: string = 'البيانات') => {
    
    // Check if it's a 401 (unauthorized) error - session expired
    if ((error as any)?.status === 401 || (error as any)?.message?.includes('401')) {
      handleSessionExpired();
    } else {
      // Other errors - show data load error
      setDataLoadErrorMessage(`فشل في تحميل ${context}. يرجى المحاولة مرة أخرى.`);
      setShowDataLoadError(true);
    }
  };

  return (
    <AdminAuthContext.Provider value={{
      admin,
      loading,
      login,
      logout,
      isAuthenticated,
      token,
      redirectToLogin,
      showSessionExpired,
      setShowSessionExpired,
      showDataLoadError,
      setShowDataLoadError,
      dataLoadErrorMessage,
      setDataLoadErrorMessage,
      handleApiError
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
