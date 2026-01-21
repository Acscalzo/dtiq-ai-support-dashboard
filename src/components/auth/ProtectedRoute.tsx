'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'agent' | 'manager';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // Not authenticated
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Check role-based access
      if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
        // Admins have access to everything, otherwise check specific role
        router.push('/dashboard');
        return;
      }
    }
  }, [user, loading, router, pathname, requiredRole]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or insufficient permissions
  if (!user || (requiredRole && user.role !== requiredRole && user.role !== 'admin')) {
    return null;
  }

  return <>{children}</>;
}
