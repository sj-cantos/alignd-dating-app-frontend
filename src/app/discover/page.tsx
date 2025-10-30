'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function Discover() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute requireCompleteProfile={true}>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center mb-2">Discover People</h1>
            <p className="text-gray-600 text-center">
              Welcome {user?.name}! Start swiping to find your perfect match.
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <p className="text-center text-gray-500">
                Swipe interface coming soon! Your profile is complete and ready.
              </p>
            </div>
            <div>
              <Button onClick={logout}>Logout</Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}