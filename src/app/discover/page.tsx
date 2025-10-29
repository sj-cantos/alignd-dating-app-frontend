'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserProfile } from '@/components/auth/UserProfile';
import { useAuth } from '@/contexts/AuthContext';

export default function Discover() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center mb-2">Welcome to Discover</h1>
            <p className="text-gray-600 text-center">
              Hello {user?.name}! This is a protected page that requires authentication.
            </p>
          </div>
          
          <div className="flex justify-center">
            <UserProfile />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}