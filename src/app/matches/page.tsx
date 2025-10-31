'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MatchCard } from '@/components/MatchCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { matchesApi, MatchUser } from '@/lib/api';
import { toast } from 'sonner';
import { Heart, RefreshCw, ArrowLeft, Users } from 'lucide-react';

export default function Matches() {
  const { user } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnmatchConfirm, setShowUnmatchConfirm] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchUser | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await matchesApi.getMatches();
      setMatches(data);
    } catch (error) {
      console.error('Failed to load matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = (matchId: string) => {
    // Navigate to messages page with the specific match
    router.push(`/messages?match=${matchId}`);
  };

  const handleUnmatchClick = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (match) {
      setSelectedMatch(match);
      setShowUnmatchConfirm(true);
    }
  };

  const handleUnmatch = async () => {
    if (!selectedMatch) return;
    
    try {
      await matchesApi.unmatch(selectedMatch.id);
      setMatches(matches.filter(match => match.id !== selectedMatch.id));
      toast.success('Successfully unmatched');
      setShowUnmatchConfirm(false);
      setSelectedMatch(null);
    } catch (error) {
      console.error('Failed to unmatch:', error);
      toast.error('Failed to unmatch');
    }
  };
  
  if (loading) {
    return (
      <ProtectedRoute requireCompleteProfile={true}>
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-black border-t-pink-500"></div>
              <p className="font-black text-xl">Loading your matches...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireCompleteProfile={true}>
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4 pb-24 md:pb-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8 animate-fade-in-up">
            <h1 className="text-xl md:text-2xl font-black text-foreground bg-secondary px-4 py-2 border-brutal border-border shadow-brutal inline-block transform rotate-1">
              💖 MATCHES
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium mt-3 ml-1">
              {matches.length} {matches.length === 1 ? 'match' : 'matches'} found
            </p>
          </div>

          {/* Matches Grid */}
          {matches.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
              {matches.map((match, index) => (
                <div
                  key={match.id}
                  className="transform hover:scale-105 transition-transform duration-200"
                  style={{
                    transform: `rotate(${(index % 2 === 0 ? 1 : -1) * (Math.random() * 2)}deg)`,
                  }}
                >
                  <MatchCard
                    match={match}
                    onMessage={handleMessage}
                    onUnmatch={handleUnmatchClick}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] rounded-lg p-12 max-w-md mx-auto">
                <Users size={80} className="mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-black text-black mb-4">No Matches Yet!</h2>
                <p className="text-gray-600 font-medium mb-6">
                  Keep swiping to find your perfect match! The more you swipe, the more likely you are to match.
                </p>
                <Button
                  onClick={() => router.push('/discover')}
                  className="bg-pink-400 hover:bg-pink-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-200 font-black"
                >
                  <Heart size={20} className="mr-2" />
                  START SWIPING
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Unmatch Confirmation Modal */}
        {showUnmatchConfirm && selectedMatch && (
          <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border-brutal border-border shadow-brutal-lg p-6 max-w-sm w-full animate-fade-in-up">
              <h3 className="text-xl font-black text-foreground mb-4">Unmatch {selectedMatch.name}?</h3>
              <p className="text-foreground/80 font-medium mb-6">
                This action cannot be undone. You won't be able to message each other anymore.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowUnmatchConfirm(false);
                    setSelectedMatch(null);
                  }}
                  variant="outline"
                  className="flex-1 border-2 border-border font-bold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUnmatch}
                  className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground border-2 border-border shadow-brutal-sm font-bold"
                >
                  Unmatch
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}