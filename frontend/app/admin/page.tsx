'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../contexts/admin-auth-context';
import { LuxuryLoading } from './components/ui/design-system';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAdminAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // Redirect authenticated admin to orders page
        router.replace('/admin/orders');
      } else {
        // Redirect unauthenticated user to login
        router.replace('/admin/login');
      }
    }
  }, [loading, isAuthenticated, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LuxuryLoading size="large" text="جاري التوجيه..." />
    </div>
  );
}
