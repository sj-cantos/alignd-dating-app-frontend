'use client';

import { useState } from 'react';
import { Heart, X, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MatchUser, SwipeAction } from '@/lib/api';

interface ProfileCardProps {
  profile: MatchUser;
  onSwipe: (action: SwipeAction) => void;
  loading?: boolean;
}

export function ProfileCard({ profile, onSwipe, loading = false }: ProfileCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLike = () => {
    if (!loading) onSwipe(SwipeAction.LIKE);
  };

  const handlePass = () => {
    if (!loading) onSwipe(SwipeAction.PASS);
  };

  return (
    <Card className="w-full max-w-sm mx-auto bg-card border-brutal border-border shadow-brutal-lg hover:shadow-brutal-lg transition-all duration-200 overflow-hidden animate-fade-in-up">
      <div className="relative h-96 bg-muted">
        {!imageError && profile.profilePictureUrl ? (
          <img
            src={profile.profilePictureUrl}
            alt={`${profile.name}'s profile`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-bright/20 to-primary/20">
            <Users size={80} className="text-muted-foreground" />
          </div>
        )}
        
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center">
            <div className="bg-card px-4 py-2 border-brutal border-border font-black">
              Processing...
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Name and Age */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-foreground">{profile.name}</h2>
            <span className="text-xl font-bold bg-secondary px-3 py-1 border-brutal border-border transform -rotate-2 text-secondary-foreground">
              {profile.age}
            </span>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-foreground/80 font-medium leading-relaxed border-l-brutal border-primary pl-3">
              {profile.bio}
            </p>
          )}

          {/* Distance */}
          {profile.distance && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={16} className="text-destructive" />
              <span className="font-medium">{Math.round(profile.distance)} km away</span>
            </div>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-black text-foreground text-sm uppercase tracking-wide">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.slice(0, 6).map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-bright/20 border-2 border-border text-foreground font-bold text-xs uppercase transform hover:scale-105 transition-transform"
                    style={{
                      transform: `rotate(${(index % 2 === 0 ? 1 : -1) * (Math.random() * 4 - 2)}deg)`,
                    }}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handlePass}
              disabled={loading}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground border-brutal border-border shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-black text-lg"
            >
              <X size={24} className="mr-2" />
              PASS
            </Button>
            <Button
              onClick={handleLike}
              disabled={loading}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground border-brutal border-border shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-black text-lg"
            >
              <Heart size={24} className="mr-2" />
              LIKE
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}