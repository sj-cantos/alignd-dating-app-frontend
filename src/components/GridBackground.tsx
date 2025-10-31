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
  // Uses foreground color with low alpha so it stays visible in light/dark
  const gridStyle: React.CSSProperties = {
    backgroundImage:
      'linear-gradient(to right, hsl(var(--foreground) / 0.12) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground) / 0.12) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
  };

  // Optional soft vignette to keep edges subtle
  const vignetteStyle: React.CSSProperties = {
    maskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)',
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0" style={gridStyle} />
      <div className="absolute inset-0" style={vignetteStyle} />
    </div>
  );
}

export default GridBackground;
