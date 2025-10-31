'use client';

import { useEffect } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MatchNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  matchName: string;
}

export function MatchNotification({ isVisible, onClose, matchName }: MatchNotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-close after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-gradient-to-br from-pink-bright/80 to-primary/80 border-brutal border-border shadow-brutal-lg max-w-md w-full animate-fade-in-up">
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            {/* Celebration Icons */}
            <div className="flex justify-center items-center gap-4">
              <Heart 
                size={48} 
                className="text-destructive animate-pulse" 
                fill="currentColor"
              />
              <Sparkles 
                size={48} 
                className="text-secondary animate-bounce" 
                fill="currentColor"
              />
              <Heart 
                size={48} 
                className="text-destructive animate-pulse" 
                fill="currentColor"
              />
            </div>

            {/* Match Text */}
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-card transform rotate-1">
                IT'S A MATCH!
              </h2>
              <p className="text-xl font-bold text-card">
                You and <span className="bg-secondary px-2 py-1 border-2 border-border transform -rotate-1 inline-block text-secondary-foreground">{matchName}</span> liked each other!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={onClose}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground border-brutal border-border shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-black text-lg py-3"
              >
                SEND A MESSAGE
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full bg-card text-foreground border-brutal border-border shadow-brutal-sm hover:shadow-brutal transition-all duration-200 font-black"
              >
                KEEP SWIPING
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}