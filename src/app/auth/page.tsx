"use client"
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';

export default function Auth() {
 
    

  return (
    <div className="min-h-screen bg-background bg-grid-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Heart className="w-12 h-12 text-primary fill-primary" />
          <h1 className="text-4xl font-display font-bold ml-2">Sparkle</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {isLogin ? 'Sign in to continue your journey' : 'Start your dating adventure'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
