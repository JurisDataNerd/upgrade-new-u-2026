'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/useGameStore';
import { FLOORS_DATA } from '@/data/mockData';

export default function PlayRedirectPage() {
  const router = useRouter();
  const getFloorStatus = useGameStore((state) => state.getFloorStatus);
  const hasHydrated = useGameStore((state) => state._hasHydrated);
  const isRegistered = useGameStore((state) =>
    Boolean(
      state.participant.isRegistered &&
        state.participant.name &&
        state.participant.nim
    )
  );

  useEffect(() => {
    // Registration gate: playing requires a completed profile (name + NIM).
    if (!hasHydrated) return;
    if (!isRegistered) {
      router.replace('/');
      return;
    }

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
  }, [hasHydrated, isRegistered, getFloorStatus, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2d1b0e] text-[#f0e0c0]">
      <div className="text-center space-y-3 font-pixel text-xs text-[#f0d060] animate-pulse">
        <span>MEMUAT ALUR PERMAINAN GENIUS...</span>
      </div>
    </div>
  );
}
