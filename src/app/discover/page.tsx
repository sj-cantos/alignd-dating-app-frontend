"use client"
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, LogOut, User } from 'lucide-react';

export default function Discover() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, loading, router]);

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background bg-grid-pattern flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-primary fill-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to auth page
  }

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-2xl font-display font-bold ml-2">Sparkle</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">{user.name}</span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl text-center">
                Welcome to Sparkle! 🎉
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-lg">
                Hello <span className="font-semibold text-primary">{user.name}</span>! 
                You&apos;ve successfully signed in.
              </p>
              
              <div className="bg-muted rounded-lg p-4 text-sm text-left">
                <h3 className="font-semibold mb-2">Your Profile Info:</h3>
                <ul className="space-y-1">
                  <li><strong>Email:</strong> {user.email}</li>
                  <li><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</li>
                  <li><strong>User ID:</strong> {user.id}</li>
                </ul>
              </div>
              
              <p className="text-muted-foreground">
                This is a demo page showing that JWT authentication is working! 
                In a real app, this would be where users discover and connect with potential matches.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}