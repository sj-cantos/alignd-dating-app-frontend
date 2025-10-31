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

  // Add global mouse/touch event listeners for dragging
  useEffect(() => {
    if (preview) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleDragMove(e.clientX, e.clientY);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        e.preventDefault();
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleGlobalTouchEnd = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      window.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, preview]);

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
  const handleMouseDown = (e: React.MouseEvent) => {
    if (preview) return;
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (preview) return;
    const touch = e.touches[0];
    if (touch) {
      handleDragStart(touch.clientX, touch.clientY);
    }
  };

  // Visuals
  const rotation = isDragging ? dragOffset.x / 20 : 0;
  const opacity = isDragging ? Math.max(0.5, 1 - Math.abs(dragOffset.x) / 300) : 1;
  const likeOpacity = Math.max(0, Math.min(1, dragOffset.x / 100));
  const nopeOpacity = Math.max(0, Math.min(1, -dragOffset.x / 100));

  return (
    <Card 
      ref={cardRef}
      className={`w-full max-w-sm mx-auto bg-card border-brutal border-border shadow-brutal-lg hover:shadow-brutal-lg overflow-hidden animate-fade-in-up select-none rounded-lg relative ${preview ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
      style={{
        transform: preview 
          ? 'translateX(0px) translateY(0px) rotate(0deg)'
          : isDragging || dragOffset.x !== 0 || dragOffset.y !== 0
          ? `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`
          : 'translateX(0px) translateY(0px) rotate(0deg)',
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        opacity: preview ? 1 : opacity,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
  <div className="absolute top-0 left-0 right-0 h-72 sm:h-80 md:h-96 bg-muted overflow-hidden pointer-events-none">
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
        draggable={false}
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
  <CardContent className="p-4 sm:p-5 md:p-6 mt-72 sm:mt-80 md:mt-96">
    <div className="space-y-3 sm:space-y-4">
      {/* Name and Age */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black text-foreground">{profile.name}</h2>
        <span className="text-base sm:text-lg font-bold bg-secondary px-2 sm:px-3 py-1 border-brutal border-border transform -rotate-2 text-secondary-foreground rounded">
          {profile.age}
        </span>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-sm sm:text-base text-foreground/80 font-medium leading-relaxed border-l-brutal border-primary pl-3">
          {profile.bio}
        </p>
      )}

      {/* Distance */}
      {typeof profile.distance === 'number' && !isNaN(profile.distance) && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin size={14} className="text-destructive sm:w-4 sm:h-4" />
          <span className="text-sm font-medium">{Math.round(profile.distance)} km away</span>
        </div>
      )}

      {/* Interests */}
      {profile.interests && profile.interests.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-black text-foreground text-xs sm:text-sm uppercase tracking-wide">Interests</h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {profile.interests.slice(0, 6).map((interest, index) => (
              <span
                key={index}
                className={`px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-bright/20 border-2 border-border text-foreground font-bold text-[10px] sm:text-xs uppercase rounded-sm transform transition-transform hover:scale-105`}
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
        <div className="flex gap-3 sm:gap-4 pt-3 sm:pt-4">
          <Button
            onClick={handlePass}
            disabled={loading}
            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground border-brutal border-border shadow-brutal-lg hover:shadow-brutal transition-all duration-200 font-black text-sm sm:text-base md:text-lg rounded"
          >
            <X size={20} className="mr-1 sm:mr-2 sm:w-6 sm:h-6" />
            PASS
          </Button>
          <Button
            onClick={handleLike}
            disabled={loading}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground border-brutal border-border shadow-brutal-lg hover:shadow-brutal transition-all duration-200 font-black text-sm sm:text-base md:text-lg rounded"
          >
            <Heart size={20} className="mr-1 sm:mr-2 sm:w-6 sm:h-6" />
            LIKE
          </Button>
        </div>
      )}
    </div>
  </CardContent>
</Card>

  );
}