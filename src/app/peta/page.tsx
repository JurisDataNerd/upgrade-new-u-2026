'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { CrtScanlines } from '@/components/layout/CrtScanlines';
import { BuildingMap } from '@/components/map/BuildingMap';

export default function PetaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <CrtScanlines />
      <Navbar />
      <main className="flex-1">
        <BuildingMap />
      </main>
    </div>
  );
}
