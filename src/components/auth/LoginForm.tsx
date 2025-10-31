'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginFormProps {
  onToggleMode: () => void;
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, error: authError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, preventing default');
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login...');
      await login({ email, password });
      console.log('Login successful');
      // Navigation will be handled by the auth context
    } catch (err: any) {
      console.error('Login error:', err);

      let errorMessage = 'Login failed';

      if (err?.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      console.log('Setting error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Welcome back! Please sign in to your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(error || authError) && (
            <div
              role="alert"
              aria-live="assertive"
              className="text-destructive text-sm font-bold bg-destructive/10 border border-destructive rounded p-2"
            >
              {error || (authError as string)}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="border-brutal border-border bg-background text-foreground shadow-brutal-sm focus:shadow-brutal transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="border-brutal border-border bg-background text-foreground shadow-brutal-sm focus:shadow-brutal transition-all duration-200"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-brutal border-border shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-black"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-accent hover:text-accent/80 font-bold hover:underline"
              disabled={loading}
            >
              Sign up
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}