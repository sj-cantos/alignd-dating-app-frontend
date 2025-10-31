"use client";

import { useAnimation, motion, useMotionValue, useTransform } from "framer-motion";
import { useCallback } from "react";
import { ProfileCard } from "./ProfileCard";
import { MatchUser, SwipeAction } from "@/lib/api";

interface SwipeableCardProps {
  profile: MatchUser;
  onSwipe: (action: SwipeAction) => void;
  loading?: boolean;
}

export function SwipeableCard({ profile, onSwipe, loading = false }: SwipeableCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-20, 0, 20]);
  const controls = useAnimation();

  const handleDragEnd = useCallback(
    async (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
      const threshold = 100;
      const velocityThreshold = 800; // px/s
      const dir = info.offset.x > 0 ? 1 : -1;
      const shouldSwipe = Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > velocityThreshold;

      if (shouldSwipe) {
        const flyOff = window.innerWidth * 1.2 * dir;
        await controls.start({ x: flyOff, rotate: 20 * dir, transition: { duration: 0.28, ease: "easeOut" } });
        onSwipe(dir > 0 ? SwipeAction.LIKE : SwipeAction.PASS);
      } else {
        await controls.start({ x: 0, rotate: 0, transition: { type: "spring", stiffness: 500, damping: 30 } });
      }
    },
    [controls, onSwipe]
  );

  return (
    <motion.div
      className="w-full"
      style={{ x, rotate }}
      animate={controls}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
    >
      <ProfileCard profile={profile} onSwipe={() => {}} loading={loading} preview={false} interactive={false} />
    </motion.div>
  );
}
