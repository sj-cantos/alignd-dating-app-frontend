'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Heart } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/discover');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg- flex flex-col items-center justify-center bg-gray-50 p-4 gap-2">
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
