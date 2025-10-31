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

  const handleUnmatch = async (matchId: string) => {
    try {
      await matchesApi.unmatch(matchId);
      setMatches(matches.filter(match => match.id !== matchId));
      toast.success('Successfully unmatched');
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
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button
                onClick={() => router.push('/discover')}
                variant="outline"
                className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-200 font-bold transform -rotate-1"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Discover
              </Button>
              
              <Button
                onClick={loadMatches}
                className="bg-blue-400 hover:bg-blue-500 text-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-200 font-bold transform rotate-1"
              >
                <RefreshCw size={20} className="mr-2" />
                Refresh
              </Button>
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl font-black text-black mb-2 transform -rotate-1">
                💖 YOUR MATCHES 💖
              </h1>
              <p className="text-xl font-bold text-gray-800 bg-yellow-300 inline-block px-4 py-2 border-2 border-black transform rotate-1">
                {matches.length} amazing {matches.length === 1 ? 'match' : 'matches'} waiting for you!
              </p>
            </div>
          </div>

          {/* Matches Grid */}
          {matches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    onUnmatch={handleUnmatch}
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
      </div>
    </ProtectedRoute>
  );
}