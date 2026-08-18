'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';

export const CrtScanlines: React.FC = () => {
  const crtEffect = useGameStore((state) => state.crtEffect);

  if (!crtEffect) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-50 crt-overlay opacity-60 mix-blend-overlay"
    />
  );
};
