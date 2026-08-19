'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/useGameStore';
import { FLOORS_DATA } from '@/data/mockData';

export default function PlayRedirectPage() {
  const router = useRouter();
  const getFloorStatus = useGameStore((state) => state.getFloorStatus);

  useEffect(() => {
    // Find the first uncompleted floor, or default to floor 1
    let targetFloor = 1;
    for (const floor of FLOORS_DATA) {
      if (getFloorStatus(floor.number) !== 'completed') {
        targetFloor = floor.number;
        break;
      }
    }

    // Redirect to the intro of target floor
    router.replace(`/play/floor/${targetFloor}/intro`);
  }, [getFloorStatus, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2d1b0e] text-[#f0e0c0]">
      <div className="text-center space-y-3 font-pixel text-xs text-[#f0d060] animate-pulse">
        <span>MEMUAT ALUR PERMAINAN GENIUS...</span>
      </div>
    </div>
  );
}
