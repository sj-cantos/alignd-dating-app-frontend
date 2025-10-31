'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Heart } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Check if profile is complete
      if (user?.isProfileComplete) {
        router.push('/discover');
      } else {
        router.push('/setup');
      }
    }
  }, [isAuthenticated, loading, user?.isProfileComplete, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-2">
      <div className="flex items-center gap-2 cursor-pointer group " onClick={() => router.push('/')}>
        <div className="bg-primary border-2 border-foreground p-2 shadow-brutal-sm transition-all duration-300 group-hover:shadow-brutal group-hover:-translate-x-1 group-hover:-translate-y-1">
          <Heart className="w-6 h-6 fill-background text-background" />
        </div>
        <h1 className="text-3xl font-display font-bold transition-colors m-5 duration-300 group-hover:text-primary">Charmd</h1>
      </div>
      {isLogin ? (
        <LoginForm onToggleMode={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onToggleMode={() => setIsLogin(true)} />
      )}
    </div>
  );
}
