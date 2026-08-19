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
    <div className="min-h-screen flex flex-col bg-[#2d1b0e] text-[#f0e0c0]">
      <CrtScanlines />
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col justify-center items-center text-center space-y-6">
        {/* Victory Badge */}
        <div className="inline-flex items-center gap-2 bg-[#14230f] border-2 border-[#7ec850] rounded-full px-5 py-1.5 shadow-lg">
          <Sparkle size={18} weight="fill" className="text-[#f0d060]" />
          <span className="font-pixel text-xs text-[#7ec850] font-bold uppercase tracking-wider">
            Lantai {floor.number} Selesai!
          </span>
        </div>

        {/* Grand Card */}
        <div className="w-full sdv-card-gold p-6 sm:p-8 space-y-6 text-center relative overflow-hidden">
          {/* Header Title */}
          <div className="space-y-2">
            <h1 className="font-pixel text-xl sm:text-3xl font-extrabold text-[#f0d060] tracking-wide">
              {hasNextFloor ? `LANTAI ${floor.number} SELESAI!` : 'SEMUA LANTAI SELESAI!'}
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#f0e6d2] max-w-lg mx-auto leading-relaxed">
              Kamu telah menyelesaikan kedua spot di{' '}
              <strong className="text-white">{floor.name}</strong> dan mengumpulkan 2 stempel.
            </p>
          </div>

          {/* 2 Collected Stamps Showcase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            {/* Stamp 1 */}
            <div className="bg-[#170f07] p-4 rounded-xl border-2 border-[#7ec850] flex items-center gap-3.5 shadow-inner">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-b from-[#3d7828] to-[#255018] border-2 border-[#f0d060] flex items-center justify-center shrink-0 shadow">
                <StampIcon name={boothA.stampIcon} size={24} className="text-[#f0d060]" />
              </div>
              <div className="text-left min-w-0">
                <span className="font-pixel text-[8px] text-[#7ec850] uppercase">
                  {boothA.code} • Stempel Resmi
                </span>
                <h4 className="font-pixel text-xs font-bold text-white truncate">
                  {boothA.name}
                </h4>
                <span className="font-mono text-[10px] text-[#f0d060]">
                  Skor: {stampA?.score ?? 2}/{stampA?.totalQuestions ?? 2} Benar
                </span>
              </div>
            </div>

            {/* Stamp 2 */}
            <div className="bg-[#170f07] p-4 rounded-xl border-2 border-[#7ec850] flex items-center gap-3.5 shadow-inner">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-b from-[#3d7828] to-[#255018] border-2 border-[#f0d060] flex items-center justify-center shrink-0 shadow">
                <StampIcon name={boothB.stampIcon} size={24} className="text-[#f0d060]" />
              </div>
              <div className="text-left min-w-0">
                <span className="font-pixel text-[8px] text-[#7ec850] uppercase">
                  {boothB.code} • Stempel Resmi
                </span>
                <h4 className="font-pixel text-xs font-bold text-white truncate">
                  {boothB.name}
                </h4>
                <span className="font-mono text-[10px] text-[#f0d060]">
                  Skor: {stampB?.score ?? 2}/{stampB?.totalQuestions ?? 2} Benar
                </span>
              </div>
            </div>
          </div>

          {/* Level Progress Banner */}
          <div className="bg-[#281c12] p-4 rounded-xl border border-[#8b6f4e] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-[#170f07] border-2 border-[#f0d060] rounded-lg flex items-center justify-center text-xl shrink-0">
                <Trophy size={22} weight="fill" className="text-[#f0d060]" />
              </div>
              <div>
                <span className="font-pixel text-[9px] text-[#a08060] uppercase">
                  Level Saat Ini:
                </span>
                <div className="font-pixel text-xs font-bold text-white flex items-center gap-2 mt-0.5">
                  <span className="text-[#f0d060]">{currentLevel}</span>
                  <span className="text-[#a08060]">•</span>
                  <span className="text-[#7ec850]">{completedFloors}/9 Lantai</span>
                </div>
              </div>
            </div>

            <PixelBadge variant="gold" size="md">
              Total: {participant.totalXp} XP
            </PixelBadge>
          </div>

          {/* Big Next Floor CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleNextAction}
              className="w-full sm:w-auto rpg-btn-primary py-4 px-10 text-xs sm:text-sm font-pixel font-bold flex items-center justify-center gap-3 shadow-xl cursor-pointer"
            >
              <span>
                {hasNextFloor
                  ? `Lanjut ke Lantai ${nextFloorNumber}`
                  : 'Buka Paspor & Sertifikat'}
              </span>
              <ArrowRight size={18} weight="bold" />
            </button>

            <Link href="/peta" className="w-full sm:w-auto">
              <button
                onClick={() => soundEnabled && soundEngine.playClick()}
                className="w-full sm:w-auto rpg-btn-wood py-4 px-6 text-xs font-pixel font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Buildings size={16} weight="bold" />
                <span>Peta</span>
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
