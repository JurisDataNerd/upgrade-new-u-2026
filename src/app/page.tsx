'use client';

import React from 'react';
import { CrtScanlines } from '@/components/layout/CrtScanlines';
import { HeroSection } from '@/components/landing/HeroSection';

export default function HomePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#2d1b0e] text-[#f0e0c0] selection:bg-[#7ec850] selection:text-[#1b120a]">
      <CrtScanlines />
      <main className="flex-1 flex flex-col">
        <HeroSection />
      </main>
    </div>
  );
}
