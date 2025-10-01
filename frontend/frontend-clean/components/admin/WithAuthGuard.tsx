'use client';

import React from 'react';
import { useAdminAuth } from '@/contexts/admin-auth-context';

interface WithAuthGuardProps {
  children: React.ReactNode;
}

export function WithAuthGuard({ children }: WithAuthGuardProps) {
  const { admin, token, loading: authLoading } = useAdminAuth();

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من صلاحية الوصول...</p>
        </div>
      </div>
    );
  }

  // Show message if not authenticated
  if (!admin || !token) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">يجب تسجيل الدخول للوصول لهذه الصفحة</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook to get authentication status and data
export function useAuthenticatedAdmin() {
  const { admin, token, loading: authLoading } = useAdminAuth();
  
  return {
    isAuthenticated: !authLoading && !!admin && !!token,
    isLoading: authLoading,
    admin,
    token,
    shouldFetchData: !authLoading && !!admin && !!token
  };
}
