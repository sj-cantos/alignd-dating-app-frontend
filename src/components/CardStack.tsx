'use client';

import { useState, useEffect } from 'react';
import { ProfileCard } from './ProfileCard';
import { SwipeableCard } from './SwipeableCard';
import { MatchUser, SwipeAction } from '@/lib/api';

interface CardStackProps {
  profiles: MatchUser[];
  onSwipe: (action: SwipeAction) => void;
  loading?: boolean;
}

export function CardStack({ profiles, onSwipe, loading = false }: CardStackProps) {
  const [visibleCards, setVisibleCards] = useState<number>(3); // Show top 3 cards
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSwipe = async (action: SwipeAction) => {
    if (isAnimating || loading) return;
    
    setIsAnimating(true);
    onSwipe(action);
    
    // Wait for animation to complete
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  if (profiles.length === 0) {
    return null;
  }

  return (
    <div className="relative z-0 w-full max-w-sm mx-auto h-[500px] sm:h-[550px] md:h-[600px]">
      {profiles.slice(0, visibleCards).map((profile, index) => {
        const isTop = index === 0;
        const zIndex = visibleCards - index;
        const scale = 1 - (index * 0.05); // Each card 5% smaller
        const yOffset = index * 10; // Each card 10px lower
        const opacity = 1 - (index * 0.2); // Fade out lower cards

        return (
          <div
            key={profile.id}
            className="absolute top-0 left-0 right-0"
            style={{
              zIndex,
              transform: `scale(${scale}) translateY(${yOffset}px)`,
              opacity: opacity,
              pointerEvents: isTop ? 'auto' : 'none',
              transition: isTop ? 'none' : 'all 0.3s ease-out',
            }}
          >
            {isTop ? (
              <SwipeableCard profile={profile} onSwipe={handleSwipe} loading={loading} />
            ) : (
              <ProfileCard profile={profile} onSwipe={() => {}} loading={false} preview={true} />
            )}
          </div>
        );
      })}
    </div>
  );
}
