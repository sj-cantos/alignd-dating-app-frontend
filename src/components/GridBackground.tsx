'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

/**
 * Full-screen subtle grid background shown on all pages except landing ('/').
 * Fixed position, non-interactive, sits behind content.
 */
export function GridBackground() {
  const pathname = usePathname();

  // Hide on landing page
  if (pathname === '/') return null;

  // Grid using 2 layered linear-gradients; theme-aware using CSS vars
  // Uses foreground color with higher alpha to ensure visibility
  const gridStyle: React.CSSProperties = {
    backgroundImage:
      'linear-gradient(to right, hsl(var(--foreground) / 0.25) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground) / 0.25) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0" style={gridStyle} />
    </div>
  );
}

export default GridBackground;
