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
  preview?: boolean; // When true, disables swipe and hides action buttons
}

export function ProfileCard({ profile, onSwipe, loading = false, preview = false }: ProfileCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Drag/swipe state (inspired by provided implementation)
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const swipeThreshold = 100;

  // Reset when profile or loading changes
  useEffect(() => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    setIsSwiping(false);
    if (cardRef.current) {
      cardRef.current.style.transition = '';
      cardRef.current.style.transform = '';
    }
  }, [profile?.id, loading]);

  const flyOffAndSwipe = (liked: boolean) => {
    if (!cardRef.current) return;
    setIsSwiping(true);
    const direction = liked ? 1 : -1;
    const flyOffDistance = window.innerWidth;
    cardRef.current.style.transition = 'transform 0.3s ease-out';
    cardRef.current.style.transform = `translateX(${direction * flyOffDistance}px) rotate(${direction * 20}deg)`;
    // Call parent swipe after animation so UI feels natural
    setTimeout(() => {
      onSwipe(liked ? SwipeAction.LIKE : SwipeAction.PASS);
    }, 300);
  };

  const handleLike = () => {
    if (loading || isSwiping) return;
    flyOffAndSwipe(true);
  };

  const handlePass = () => {
    if (loading || isSwiping) return;
    flyOffAndSwipe(false);
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    if (isSwiping || loading) return;
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || isSwiping || loading) return;
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleDragEnd = () => {
    if (!isDragging || isSwiping || loading) return;
    setIsDragging(false);
    if (Math.abs(dragOffset.x) > swipeThreshold) {
      const liked = dragOffset.x > 0;
      flyOffAndSwipe(liked);
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX, e.clientY);
  const handleMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX, e.clientY);
  const handleMouseUp = () => handleDragEnd();

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  };
  const handleTouchEnd = () => handleDragEnd();

  // Visuals
  const rotation = isDragging ? dragOffset.x / 20 : 0;
  const opacity = isDragging ? Math.max(0.5, 1 - Math.abs(dragOffset.x) / 300) : 1;
  const likeOpacity = Math.max(0, Math.min(1, dragOffset.x / 100));
  const nopeOpacity = Math.max(0, Math.min(1, -dragOffset.x / 100));

  return (
    <Card className="w-full max-w-sm mx-auto bg-card border-brutal border-border shadow-brutal-lg hover:shadow-brutal-lg transition-all duration-200 overflow-hidden animate-fade-in-up select-none rounded-lg relative">
  <div
    ref={cardRef}
    className={`absolute top-0 left-0 right-0 h-96 bg-muted ${preview ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} touch-none overflow-hidden`}
    style={{
      transform: preview 
        ? 'translateX(0) translateY(0) rotate(0deg)'
        : isDragging
        ? `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`
        : 'translateX(0) translateY(0) rotate(0deg)',
      transition: isDragging ? 'none' : 'transform 0.3s ease-out',
      opacity: preview ? 1 : opacity,
    }}
    {...(!preview && {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    })}
  >
    {/* Profile Image */}
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

    {/* Top gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

    {/* Swipe indicators */}
    {!preview && isDragging && (
      <>
        <div
          className="absolute top-6 left-6 transform -rotate-12 pointer-events-none transition-opacity"
          style={{ opacity: likeOpacity }}
        >
          <div className="bg-success border-brutal border-border px-5 py-2 shadow-brutal-lg flex items-center justify-center">
            <Heart className="w-8 h-8 text-success-foreground fill-success-foreground" />
          </div>
        </div>
        <div
          className="absolute top-6 right-6 transform rotate-12 pointer-events-none transition-opacity"
          style={{ opacity: nopeOpacity }}
        >
          <div className="bg-destructive border-brutal border-border px-5 py-2 shadow-brutal-lg flex items-center justify-center">
            <X className="w-8 h-8 text-destructive-foreground" />
          </div>
        </div>
      </>
    )}

    {/* Loading overlay */}
    {loading && (
      <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center">
        <div className="bg-card px-6 py-3 border-brutal border-border font-black rounded-lg">Processing...</div>
      </div>
    )}
  </div>

  {/* Card Content */}
  <CardContent className="p-6 mt-96">
    <div className="space-y-4">
      {/* Name and Age */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-foreground">{profile.name}</h2>
        <span className="text-lg font-bold bg-secondary px-3 py-1 border-brutal border-border transform -rotate-2 text-secondary-foreground rounded">
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
      {typeof profile.distance === 'number' && (
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
                className={`px-3 py-1 bg-blue-bright/20 border-2 border-border text-foreground font-bold text-xs uppercase rounded-sm transform transition-transform hover:scale-105`}
                style={{ transform: `rotate(${(index % 2 === 0 ? 1 : -1) * (Math.random() * 3 + 1)}deg)` }}
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!preview && (
        <div className="flex gap-4 pt-4">
          <Button
            onClick={handlePass}
            disabled={loading}
            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground border-brutal border-border shadow-brutal-lg hover:shadow-brutal transition-all duration-200 font-black text-lg rounded"
          >
            <X size={24} className="mr-2" />
            PASS
          </Button>
          <Button
            onClick={handleLike}
            disabled={loading}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground border-brutal border-border shadow-brutal-lg hover:shadow-brutal transition-all duration-200 font-black text-lg rounded"
          >
            <Heart size={24} className="mr-2" />
            LIKE
          </Button>
        </div>
      )}
    </div>
  </CardContent>
</Card>

  );
}