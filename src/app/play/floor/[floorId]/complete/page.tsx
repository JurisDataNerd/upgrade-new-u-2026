'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Sparkle,
  CheckCircle,
  ArrowRight,
  IdentificationBadge,
  Buildings,
  SealCheck,
} from '@phosphor-icons/react';
import { FLOORS_DATA, BOOTHS_DATA, LEVEL_CONFIG } from '@/data/mockData';
import { useGameStore } from '@/store/useGameStore';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { StampIcon } from '@/components/ui/StampIcon';
import { Navbar } from '@/components/layout/Navbar';
import { CrtScanlines } from '@/components/layout/CrtScanlines';
import { soundEngine } from '@/lib/sound';

export default function FloorCompletePage() {
  const params = useParams();
  const router = useRouter();
  const floorNumber = parseInt((params.floorId as string) || '1', 10);

  const participant = useGameStore((state) => state.participant);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const currentLevel = useGameStore((state) => state.getCurrentLevel());
  const completedFloors = useGameStore((state) => state.getCompletedFloorsCount());

  const floor =
    FLOORS_DATA.find((f) => f.number === floorNumber) || FLOORS_DATA[0];
  const boothA = BOOTHS_DATA[floor.boothIds[0]];
  const boothB = BOOTHS_DATA[floor.boothIds[1]];

  const stampA = participant.stamps[boothA.id];
  const stampB = participant.stamps[boothB.id];

  const currentLevelData =
    LEVEL_CONFIG.find((l) => l.level === currentLevel) || LEVEL_CONFIG[0];
  const hasNextFloor = floorNumber < 9;
  const nextFloorNumber = floorNumber + 1;

  useEffect(() => {
    // Trigger festive celebratory confetti
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#7ec850', '#f0d060', '#60a8d8', '#c4956a', '#ffffff'],
    });

    if (soundEnabled) {
      soundEngine.playLevelUp();
    }
  }, [soundEnabled]);

  const handleNextAction = () => {
    if (soundEnabled) soundEngine.playClick();
    if (hasNextFloor) {
      router.push(`/play/floor/${nextFloorNumber}/intro`);
    } else {
      router.push('/paspor');
    }
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] max-h-[100dvh] flex flex-col bg-[#2d1b0e] text-[#f0e0c0] overflow-hidden">
      <CrtScanlines />
      <Navbar />

      <main className="max-w-2xl mx-auto px-2.5 sm:px-6 py-2 sm:py-3 flex-1 flex flex-col justify-between items-center text-center overflow-hidden w-full gap-2">
        {/* Victory Badge */}
        <div className="inline-flex items-center gap-1.5 bg-[#14230f] border-2 border-[#7ec850] rounded-full px-3 py-1 shadow-md shrink-0">
          <Sparkle size={14} weight="fill" className="text-[#f0d060]" />
          <span className="font-pixel text-[9px] text-[#7ec850] font-bold uppercase tracking-wider">
            Lantai {floor.number} Selesai!
          </span>
        </div>

        {/* Grand Card */}
        <div className="w-full flex-1 sdv-card-gold p-3 sm:p-5 flex flex-col justify-between text-center overflow-hidden shadow-2xl">
          {/* Header Title */}
          <div className="space-y-1 shrink-0">
            <h1 className="font-pixel text-sm sm:text-xl font-bold text-[#f0d060] tracking-wide leading-snug break-words">
              {hasNextFloor ? `LANTAI ${floor.number} TUNTAS!` : 'SEMUA LANTAI TUNTAS!'}
            </h1>
            <p className="font-sans text-[11px] sm:text-xs text-[#f0e6d2] max-w-md mx-auto leading-snug break-words">
              2 stempel di <strong>{floor.name}</strong> berhasil dikumpulkan!
            </p>
          </div>

          {/* 2 Collected Stamps Showcase (2 cols) */}
          <div className="grid grid-cols-2 gap-2 my-1">
            {/* Stamp 1 */}
            <div className="bg-[#170f07] p-2 rounded-xl border-2 border-[#7ec850] flex items-center gap-2 shadow-inner">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-b from-[#3d7828] to-[#255018] border border-[#f0d060] flex items-center justify-center shrink-0 shadow">
                <StampIcon name={boothA.stampIcon} size={16} className="text-[#f0d060]" />
              </div>
              <div className="text-left min-w-0 flex-1">
                <span className="font-pixel text-[7px] text-[#7ec850] uppercase block">
                  {boothA.code} • Stempel
                </span>
                <h4 className="font-sans text-xs font-bold text-white leading-tight break-words mt-0.5">
                  {boothA.name}
                </h4>
                <span className="font-mono text-[9px] text-[#f0d060] block mt-0.5">
                  Skor: {stampA?.score ?? 2}/{stampA?.totalQuestions ?? 2} Benar
                </span>
              </div>
            </div>

            {/* Stamp 2 */}
            <div className="bg-[#170f07] p-2 rounded-xl border-2 border-[#7ec850] flex items-center gap-2 shadow-inner">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-b from-[#3d7828] to-[#255018] border border-[#f0d060] flex items-center justify-center shrink-0 shadow">
                <StampIcon name={boothB.stampIcon} size={16} className="text-[#f0d060]" />
              </div>
              <div className="text-left min-w-0 flex-1">
                <span className="font-pixel text-[7px] text-[#7ec850] uppercase block">
                  {boothB.code} • Stempel
                </span>
                <h4 className="font-sans text-xs font-bold text-white leading-tight break-words mt-0.5">
                  {boothB.name}
                </h4>
                <span className="font-mono text-[9px] text-[#f0d060] block mt-0.5">
                  Skor: {stampB?.score ?? 2}/{stampB?.totalQuestions ?? 2} Benar
                </span>
              </div>
            </div>
          </div>

          {/* Level Progress Banner */}
          <div className="bg-[#281c12] p-2 sm:p-2.5 rounded-xl border border-[#8b6f4e] flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#170f07] border border-[#f0d060] rounded-lg flex items-center justify-center text-base shrink-0">
                <Trophy size={16} weight="fill" className="text-[#f0d060]" />
              </div>
              <div className="text-left min-w-0">
                <div className="font-pixel text-[10px] sm:text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                  <span className="text-[#f0d060]">{currentLevel}</span>
                  <span className="text-[#a08060]">•</span>
                  <span className="text-[#7ec850]">{completedFloors}/9 Lt</span>
                </div>
              </div>
            </div>

            <PixelBadge variant="gold" size="sm">
              {participant.totalXp} XP
            </PixelBadge>
          </div>

          {/* Action CTAs */}
          <div className="pt-1 flex items-center justify-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleNextAction}
              className="flex-1 rpg-btn-primary py-2.5 sm:py-3 px-4 text-xs font-pixel font-bold flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              <span>
                {hasNextFloor
                  ? `Lanjut L${nextFloorNumber}`
                  : 'Buka Paspor'}
              </span>
              <ArrowRight size={14} weight="bold" />
            </button>

            <Link href="/peta" className="shrink-0">
              <button
                onClick={() => soundEnabled && soundEngine.playClick()}
                className="rpg-btn-wood py-2.5 sm:py-3 px-3 text-xs font-pixel font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Buildings size={14} weight="bold" />
                <span>Peta</span>
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
