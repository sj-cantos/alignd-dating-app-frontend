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
  interactive?: boolean; // When false, disables internal drag handlers (used with TinderCard)
}

export function ProfileCard({ profile, onSwipe, loading = false, preview = false, interactive = true }: ProfileCardProps) {
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

  const handleLike = () => {
    if (loading || isSwiping) return;
    
    if (!cardRef.current) return;
    setIsSwiping(true);
    const flyOffDistance = window.innerWidth;
    cardRef.current.style.transition = 'transform 0.3s ease-out';
    cardRef.current.style.transform = `translateX(${flyOffDistance}px) rotate(20deg)`;
    
    setTimeout(() => {
      onSwipe(SwipeAction.LIKE);
    }, 300);
  };

  const handlePass = () => {
    if (loading || isSwiping) return;
    
    if (!cardRef.current) return;
    setIsSwiping(true);
    const flyOffDistance = window.innerWidth;
    cardRef.current.style.transition = 'transform 0.3s ease-out';
    cardRef.current.style.transform = `translateX(-${flyOffDistance}px) rotate(-20deg)`;
    
    setTimeout(() => {
      onSwipe(SwipeAction.PASS);
    }, 300);
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
      // Swipe detected - animate card off screen
      const direction = dragOffset.x > 0 ? 'right' : 'left';
      
      if (cardRef.current) {
        const flyOffDistance = window.innerWidth;
        cardRef.current.style.transition = 'transform 0.3s ease-out';
        cardRef.current.style.transform = `translateX(${direction === 'right' ? flyOffDistance : -flyOffDistance}px) rotate(${direction === 'right' ? 20 : -20}deg)`;
      }

      setIsSwiping(true);
      const liked = dragOffset.x > 0;
      
      // Call parent swipe after animation so UI feels natural
      setTimeout(() => {
        onSwipe(liked ? SwipeAction.LIKE : SwipeAction.PASS);
      }, 300);
    } else {
      // Return to center
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (preview) return;
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (preview) return;
    handleDragMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    if (preview) return;
    handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (preview) return;
    const touch = e.touches[0];
    if (touch) {
      handleDragStart(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (preview) return;
    const touch = e.touches[0];
    if (touch) {
      handleDragMove(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = () => {
    if (preview) return;
    handleDragEnd();
  };

  // Pointer events (robust drag across mouse/touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (preview || isSwiping || loading) return;
    try {
      cardRef.current?.setPointerCapture(e.pointerId);
    } catch {}
    handleDragStart(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (preview) return;
    handleDragMove(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    if (preview) return;
    handleDragEnd();
  };

  // Visuals
  const rotation = interactive && isDragging ? dragOffset.x / 20 : 0;
  const opacity = interactive && isDragging ? Math.max(0.5, 1 - Math.abs(dragOffset.x) / 300) : 1;
  const likeOpacity = Math.max(0, Math.min(1, dragOffset.x / 100));
  const nopeOpacity = Math.max(0, Math.min(1, -dragOffset.x / 100));

  return (
    <Card 
      ref={cardRef}
      className={`w-full max-w-sm mx-auto bg-card border-brutal border-border shadow-brutal-lg hover:shadow-brutal-lg overflow-hidden animate-fade-in-up select-none rounded-lg relative touch-none ${preview ? 'cursor-default' : isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        transform: preview || !interactive
          ? 'translateX(0px) translateY(0px) rotate(0deg)'
          : isDragging || dragOffset.x !== 0 || dragOffset.y !== 0
          ? `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`
          : 'translateX(0px) translateY(0px) rotate(0deg)',
        transition: interactive && isDragging ? 'none' : 'transform 0.3s ease-out',
        opacity: preview || !interactive ? 1 : opacity,
      }}
      onMouseDown={interactive ? handleMouseDown : undefined}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseUp={interactive ? handleMouseUp : undefined}
      onMouseLeave={interactive ? handleMouseUp : undefined}
      onTouchStart={interactive ? handleTouchStart : undefined}
      onTouchMove={interactive ? handleTouchMove : undefined}
      onTouchEnd={interactive ? handleTouchEnd : undefined}
      onPointerDown={interactive ? handlePointerDown : undefined}
      onPointerMove={interactive ? handlePointerMove : undefined}
      onPointerUp={interactive ? handlePointerUp : undefined}
    >
  <div className="absolute top-0 left-0 right-0 h-64 sm:h-72 md:h-80 bg-muted overflow-hidden pointer-events-none">
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
    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

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
  <CardContent className="p-4  sm:p-5 md:p-6 mt-64 sm:mt-72 md:mt-80 pointer-events-none">
    <div className="space-y-3 sm:space-y-4 pointer-events-auto">
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
    </div>
  </CardContent>
</Card>

  );
}