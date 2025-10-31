'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CardStack } from '@/components/CardStack';
import { MatchNotification } from '@/components/MatchNotification';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { matchesApi, MatchUser, SwipeAction } from '@/lib/api';
import { toast } from 'sonner';
import { Heart, RotateCcw, Users, X } from 'lucide-react';

export default function Discover() {
  const { user, logout } = useAuth();
  const [profiles, setProfiles] = useState<MatchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipeLoading, setSwipeLoading] = useState(false);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [matchedUserName, setMatchedUserName] = useState('');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await matchesApi.getPotentialMatches(10);
      setProfiles(data);
    } catch (error) {
      console.error('Failed to load profiles:', error);
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action: SwipeAction) => {
    const currentProfile = profiles[0];
    if (!currentProfile || swipeLoading) return;

    try {
      setSwipeLoading(true);
      const response = await matchesApi.swipe({
        targetUserId: currentProfile.id,
        action,
      });

      // Show match notification if it's a match
      if (response.isMatch) {
        setMatchedUserName(currentProfile.name);
        setShowMatchNotification(true);
      }

      // Remove swiped profile from stack
      setProfiles(prev => prev.slice(1));

      // Load more profiles if running low
      if (profiles.length <= 3) {
        loadProfiles();
      }

      // Show appropriate toast
      if (action === SwipeAction.LIKE) {
        if (response.isMatch) {
          toast.success(`🎉 It's a match with ${currentProfile.name}!`);
        } else {
          toast.success('Profile liked!');
        }
      } else {
        toast.info('Profile passed');
      }
    } catch (error) {
      console.error('Failed to swipe:', error);
      toast.error('Failed to process swipe');
    } finally {
      setSwipeLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireCompleteProfile={true}>
        <div className="min-h-screen bg-background bg-grid-pattern-sm flex items-center justify-center">
          <div className="bg-card border-brutal border-border shadow-brutal-lg p-8">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-brutal border-border border-t-primary"></div>
              <p className="font-black text-xl text-foreground">Loading amazing people...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireCompleteProfile={true}>
      <div className="min-h-screen bg-background bg-grid-pattern-sm p-3 sm:p-4 pb-24 md:pb-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8 animate-fade-in-up">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground bg-pink-400 px-2 sm:px-4 py-1.5 sm:py-2 border-brutal border-border shadow-brutal inline-block transform -rotate-1">
              💘 DISCOVER
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium mt-2 sm:mt-3 ml-1">
              Swipe to find your perfect match
            </p>
          </div>
    
          {/* Profile Cards Stack */}
          <div className="relative mb-6 sm:mb-8 animation-delay-200">
            {profiles.length > 0 ? (
              <CardStack
                profiles={profiles}
                onSwipe={handleSwipe}
                loading={swipeLoading}
              />
            ) : !loading ? (
              <div className="bg-card border-brutal mt-20 border-border shadow-brutal-lg p-12 text-center animate-fade-in-up">
                <Users size={80} className="mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-black text-foreground mb-4">No More Profiles!</h2>
                <p className="text-muted-foreground font-medium mb-6">
                  You've seen all available profiles. Check back later for more!
                </p>
                <Button
                  onClick={loadProfiles}
                  className="bg-blue-bright hover:bg-blue-bright/90 text-card border-brutal border-border shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-black"
                >
                  <RotateCcw size={20} className="mr-2" />
                  REFRESH
                </Button>
              </div>
            ) : null}
          </div>

          {/* Action Buttons */}
          {profiles.length > 0 && (
            <div className="flex justify-center gap-4 sm:gap-6 animate-fade-in-up animation-delay-300">
              <Button
                onClick={() => handleSwipe(SwipeAction.PASS)}
                disabled={swipeLoading}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-card hover:bg-destructive/10 border-brutal border-border shadow-brutal hover:shadow-brutal-lg transition-all duration-200"
              >
                <X size={28} className="text-destructive sm:w-8 sm:h-8" />
              </Button>
              <Button
                onClick={() => handleSwipe(SwipeAction.LIKE)}
                disabled={swipeLoading}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-card hover:bg-success/10 border-brutal border-border shadow-brutal hover:shadow-brutal-lg transition-all duration-200"
              >
                <Heart size={28} className="text-success sm:w-8 sm:h-8" />
              </Button>
            </div>
          )}

       
        </div>

        {/* Match Notification */}
        <MatchNotification
          isVisible={showMatchNotification}
          onClose={() => setShowMatchNotification(false)}
          matchName={matchedUserName}
        />
      </div>
    </ProtectedRoute>
  );
}