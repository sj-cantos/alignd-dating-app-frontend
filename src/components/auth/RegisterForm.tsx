'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RegisterFormProps {
  onToggleMode: () => void;
}

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, error: authError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register({ email, password, name });
      // Navigation will be handled by the auth context
    } catch (err: unknown) {
      console.error('Registration error:', err);
      
      // Extract error message from API response
      let errorMessage = 'Registration failed';
      
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'response' in err) {
        const apiError = err as any;
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        } else if (apiError.response?.status === 401) {
          errorMessage = 'User with this email already exists';
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-card border-brutal border-border shadow-brutal">
      <CardHeader >
        <CardTitle >Create Account</CardTitle>
        <CardDescription>Sign up to get started with your account.</CardDescription>
      </CardHeader>
      <CardContent >
        <form onSubmit={handleSubmit} className="space-y-4">
          {(error || authError) && (
            <div role="alert" aria-live="assertive" className="text-destructive text-sm font-bold bg-destructive/10 border border-destructive rounded p-2">
              {error || (authError as string)}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name" className="font-bold text-foreground">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="border-brutal border-border bg-background text-foreground shadow-brutal-sm focus:shadow-brutal transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold text-foreground">Email</Label>
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
            <Label htmlFor="password" className="font-bold text-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
              className="border-brutal border-border bg-background text-foreground shadow-brutal-sm focus:shadow-brutal transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-bold text-foreground">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
              className={`border-brutal border-border bg-background text-foreground shadow-brutal-sm focus:shadow-brutal transition-all duration-200 ${
                confirmPassword && password !== confirmPassword 
                  ? 'border-destructive focus:border-destructive' 
                  : ''
              }`}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-destructive text-sm font-medium">Passwords do not match</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-secondary/90 text-secondary-foreground border-brutal border-border shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-black" 
            disabled={loading || (!!password && !!confirmPassword && password !== confirmPassword)}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-accent hover:text-accent/80 font-bold hover:underline"
              disabled={loading}
            >
              Sign in
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}