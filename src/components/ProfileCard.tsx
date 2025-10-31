'use client';

import { useEffect, useRef, useState } from 'react';
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
  // drag state
  const [dragging, setDragging] = useState(false);
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const pointerIdRef = useRef<number | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const threshold = 120; // px to trigger swipe

  // Reset transforms when loading state changes or profile changes
  useEffect(() => {
    setDragging(false);
    setDx(0);
    setDy(0);
    pointerIdRef.current = null;
    startRef.current = null;
  }, [loading, profile?.id]);

  const handleLike = () => {
    if (!loading) onSwipe(SwipeAction.LIKE);
  };

  const handlePass = () => {
    if (!loading) onSwipe(SwipeAction.PASS);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (loading) return;
    // Only primary button / single touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;
    startRef.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    if (pointerIdRef.current !== e.pointerId) return;
    const start = startRef.current;
    if (!start) return;
    const ndx = e.clientX - start.x;
    const ndy = e.clientY - start.y;
    setDx(ndx);
    setDy(ndy);
  };

  const onPointerUpOrCancel = (e: React.PointerEvent) => {
    if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
    const finalDx = dx;
    // Release capture
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    pointerIdRef.current = null;
    startRef.current = null;

    // Decide swipe
    if (!loading) {
      if (finalDx > threshold) {
        onSwipe(SwipeAction.LIKE);
      } else if (finalDx < -threshold) {
        onSwipe(SwipeAction.PASS);
      }
    }

    // Reset position
    setDragging(false);
    setDx(0);
    setDy(0);
  };

  const rotation = Math.max(-20, Math.min(20, dx * 0.05));
  const likeOpacity = Math.min(1, Math.max(0, dx / threshold));
  const nopeOpacity = Math.min(1, Math.max(0, -dx / threshold));

  return (
    <Card
      className="w-full max-w-sm mx-auto bg-card border-brutal border-border shadow-brutal-lg hover:shadow-brutal-lg transition-all duration-200 overflow-hidden animate-fade-in-up select-none touch-pan-y"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUpOrCancel}
      onPointerCancel={onPointerUpOrCancel}
      style={{
        transform: `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`,
        transition: dragging ? 'none' : 'transform 200ms ease',
        cursor: dragging ? 'grabbing' : 'grab',
      }}
    >
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

        {/* Swipe badges */}
        <div className="pointer-events-none absolute inset-0">
          {/* LIKE badge */}
          <div
            className="absolute top-4 left-4 px-4 py-2 border-brutal border-border bg-success text-success-foreground font-black shadow-brutal transform -rotate-6"
            style={{ opacity: likeOpacity }}
          >
            LIKE
          </div>
          {/* NOPE badge */}
          <div
            className="absolute top-4 right-4 px-4 py-2 border-brutal border-border bg-destructive text-destructive-foreground font-black shadow-brutal transform rotate-6"
            style={{ opacity: nopeOpacity }}
          >
            NOPE
          </div>
        </div>
        
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