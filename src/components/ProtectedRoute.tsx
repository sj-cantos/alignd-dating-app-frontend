'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireCompleteProfile?: boolean;
}

export function ProtectedRoute({ children, requireCompleteProfile = false }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth');
        return;
      }

      if (requireCompleteProfile && user && !user.isProfileComplete) {
        router.push('/setup');
        return;
      }
    }
  }, [isAuthenticated, loading, user, router, requireCompleteProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || (requireCompleteProfile && user && !user.isProfileComplete)) {
    return null;
  }

  return <>{children}</>;
}