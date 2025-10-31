'use client';

import { useState } from 'react';
import { MessageCircle, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MatchUser } from '@/lib/api';

interface MatchCardProps {
  match: MatchUser;
  onMessage: (matchId: string) => void;
  onUnmatch?: (matchId: string) => void;
}

export function MatchCard({ match, onMessage, onUnmatch }: MatchCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showUnmatchConfirm, setShowUnmatchConfirm] = useState(false);

  const handleMessage = () => {
    onMessage(match.id);
  };

  const handleUnmatch = () => {
    if (onUnmatch) {
      onUnmatch(match.id);
      setShowUnmatchConfirm(false);
    }
  };

  return (
    <Card className="bg-card border-brutal border-border shadow-brutal hover:shadow-brutal-lg transition-all duration-200 overflow-hidden group animate-fade-in-up relative">
      <div className="absolute top-0 left-0 right-0 h-52 bg-muted">
        {!imageError && match.profilePictureUrl ? (
          <img
            src={match.profilePictureUrl}
            alt={`${match.name}'s profile`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-bright/20 to-primary/20">
            <Users size={60} className="text-muted-foreground" />
          </div>
        )}
        
        {/* Unmatch button */}
        {onUnmatch && (
          <button
            onClick={() => setShowUnmatchConfirm(true)}
            className="absolute top-2 right-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground p-2 border-2 border-border shadow-brutal-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <CardContent className="p-4 mt-48">
        <div className="space-y-3">
          {/* Name and Age */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-foreground">{match.name}</h3>
            <span className="text-sm font-bold bg-secondary px-2 py-1 border-2 border-border transform -rotate-2 text-secondary-foreground">
              {match.age}
            </span>
          </div>

          {/* Bio (truncated) */}
          {match.bio && (
            <p className="text-foreground/80 text-sm font-medium line-clamp-2">
              {match.bio}
            </p>
          )}

          {/* Distance */}
          {match.distance && (
            <p className="text-xs font-bold text-muted-foreground">
              {Math.round(match.distance)} km away
            </p>
          )}

          {/* Message Button */}
          <Button
            onClick={handleMessage}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground border-brutal border-border shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-black"
          >
            <MessageCircle size={16} className="mr-2" />
            MESSAGE
          </Button>
        </div>
      </CardContent>

      {/* Unmatch Confirmation Modal */}
      {showUnmatchConfirm && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border-brutal border-border shadow-brutal-lg p-6 max-w-sm w-full">
            <h3 className="text-xl font-black text-foreground mb-4">Unmatch {match.name}?</h3>
            <p className="text-foreground/80 font-medium mb-6">
              This action cannot be undone. You won't be able to message each other anymore.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowUnmatchConfirm(false)}
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
    </Card>
  );
}