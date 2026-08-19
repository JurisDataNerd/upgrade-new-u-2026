'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { CrtScanlines } from '@/components/layout/CrtScanlines';
import { BuildingMap } from '@/components/map/BuildingMap';

export default function PetaPage() {
  return (
    <div className="min-h-[100dvh] h-[100dvh] max-h-[100dvh] flex flex-col bg-[#2d1b0e] text-[#f0e0c0] overflow-hidden">
      <CrtScanlines />
      <Navbar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <BuildingMap />
      </main>
    </div>
  );
}
