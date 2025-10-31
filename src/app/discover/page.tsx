'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ProfileCard } from '@/components/ProfileCard';
import { MatchNotification } from '@/components/MatchNotification';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { matchesApi, MatchUser, SwipeAction } from '@/lib/api';
import { toast } from 'sonner';
import { Heart, RotateCcw, Users } from 'lucide-react';

export default function Discover() {
  const { user, logout } = useAuth();
  const [profiles, setProfiles] = useState<MatchUser[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeLoading, setSwipeLoading] = useState(false);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [matchedUserName, setMatchedUserName] = useState('');

  const currentProfile = profiles[currentProfileIndex];

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await matchesApi.getPotentialMatches(10);
      setProfiles(data);
      setCurrentProfileIndex(0);
    } catch (error) {
      console.error('Failed to load profiles:', error);
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action: SwipeAction) => {
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

      // Move to next profile
      if (currentProfileIndex < profiles.length - 1) {
        setCurrentProfileIndex(currentProfileIndex + 1);
      } else {
        // Load more profiles if we've reached the end
        await loadProfiles();
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
      <div className="min-h-screen bg-background bg-grid-pattern-sm p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
    
          {/* Profile Cards */}
          <div className="relative mb-8 animation-delay-200">
            {currentProfile ? (
              <ProfileCard
                profile={currentProfile}
                onSwipe={handleSwipe}
                loading={swipeLoading}
              />
            ) : (
              <div className="bg-card border-brutal border-border shadow-brutal-lg p-12 text-center animate-fade-in-up">
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
            )}
          </div>

       
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