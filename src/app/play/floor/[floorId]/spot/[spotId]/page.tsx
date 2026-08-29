'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  CheckCircle,
  BookOpen,
  CaretRight,
  ArrowRight,
  Sparkle,
} from '@phosphor-icons/react';
import { BOOTHS_DATA, FLOORS_DATA, AVATAR_OPTIONS } from '@/data/mockData';
import { useGameStore } from '@/store/useGameStore';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { CelebrationModal } from '@/components/ui/CelebrationModal';
import { StampIcon } from '@/components/ui/StampIcon';
import { Navbar } from '@/components/layout/Navbar';
import { CrtScanlines } from '@/components/layout/CrtScanlines';
import { MiniGameContainer } from '@/components/minigames/MiniGameContainer';
import { soundEngine } from '@/lib/sound';
import { PlayerLevel, StampRecord } from '@/types/game';

export default function LinearSpotPage() {
  const params = useParams();
  const router = useRouter();
  const floorNumber = parseInt((params.floorId as string) || '1', 10);
  const spotId = (params.spotId as string) || '';

  const booth = BOOTHS_DATA[spotId];
  const participant = useGameStore((state) => state.participant);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const completeBooth = useGameStore((state) => state.completeBooth);
  const isAlreadyCompleted = useGameStore((state) => state.isBoothCompleted(spotId));

  const floor =
    FLOORS_DATA.find((f) => f.number === floorNumber) || FLOORS_DATA[0];
  const boothA = BOOTHS_DATA[floor.boothIds[0]];
  const boothB = BOOTHS_DATA[floor.boothIds[1]];

  const isSpot1 = booth ? booth.id === boothA.id : true;
  const isSpot2 = booth ? booth.id === boothB.id : false;

  const selectedAvatarObj =
    AVATAR_OPTIONS.find((a) => a.id === participant.avatar) || AVATAR_OPTIONS[0];

  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationDetails, setCelebrationDetails] = useState<{
    stampRecord: StampRecord | null;
    isFloorCompleted: boolean;
    floorNumber: number;
    isLevelUp: boolean;
    newLevel: PlayerLevel;
  }>({
    stampRecord: null,
    isFloorCompleted: false,
    floorNumber: floor.number,
    isLevelUp: false,
    newLevel: 'New You',
  });

  if (!booth) {
    return (
      <div className="min-h-screen flex flex-col bg-[#2d1b0e] text-[#f0e0c0]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="p-8 max-w-md sdv-card-gold text-center space-y-4">
            <h2 className="font-pixel text-base font-bold text-[#ff8080]">
              SPOT TIDAK DITEMUKAN
            </h2>
            <p className="font-sans text-sm text-[#d0c0a0]">
              Spot &quot;{spotId}&quot; tidak terdaftar di Lantai {floorNumber}.
            </p>
            <Link href={`/play/floor/${floorNumber}/intro`}>
              <button className="rpg-btn-primary py-3 px-6 text-xs font-pixel font-bold">
                Kembali ke Intro Lantai
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleMiniGameComplete = (score: number, totalQuestions: number) => {
    if (soundEnabled) soundEngine.playCorrect();

    const result = completeBooth(booth.id, score, totalQuestions);

    const stampRecord: StampRecord = {
      boothId: booth.id,
      boothName: booth.name,
      floorNumber: booth.floorNumber,
      stampTitle: booth.stampTitle,
      stampIcon: booth.stampIcon,
      stampColor: booth.stampColor,
      earnedAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      score,
      totalQuestions,
    };

    setCelebrationDetails({
      stampRecord,
      isFloorCompleted: result.isFloorCompleted,
      floorNumber: booth.floorNumber,
      isLevelUp: result.isLevelUp,
      newLevel: result.newLevel,
    });

    setShowCelebration(true);
  };

  const handleNextStep = () => {
    setShowCelebration(false);
    if (isSpot1) {
      // Spot 1 done -> go to Spot 2
      router.push(`/play/floor/${floor.number}/spot/${boothB.id}`);
    } else {
      // Spot 2 done -> Floor is complete! Go to floor completion transition page
      router.push(`/play/floor/${floor.number}/complete`);
    }
  };

  const [showStoryModal, setShowStoryModal] = useState<boolean>(false);

  return (
    <div className="min-h-[100dvh] h-[100dvh] max-h-[100dvh] flex flex-col bg-[#2d1b0e] text-[#f0e0c0] overflow-hidden">
      <CrtScanlines />
      <Navbar />

      <main className="max-w-2xl mx-auto px-2.5 sm:px-6 py-1.5 sm:py-2.5 flex-1 flex flex-col justify-between overflow-hidden w-full gap-1.5 sm:gap-2">
        {/* Top Spot Status Bar (2-Row RPG Panel for Mobile-First & Pixel Theme) */}
        <div className="bg-[#1f140a] border-2 border-[#5a3a18] rounded-xl p-2 sm:p-2.5 shadow-md shrink-0 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Link
                href={`/play/floor/${floor.number}/intro`}
                onClick={() => soundEnabled && soundEngine.playClick()}
                className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-pixel text-[#c4956a] hover:text-[#f0d060] transition-colors shrink-0 bg-[#170f07] px-2 py-1 rounded border border-[#5a3a18]"
              >
                <ArrowLeft size={12} weight="bold" />
                <span>LT {floor.number}</span>
              </Link>

              <span className="font-pixel text-[8px] sm:text-[9px] text-[#f0d060] bg-[#281c12] px-1.5 py-1 rounded border border-[#5a3a18]">
                {booth.code}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (soundEnabled) soundEngine.playSelect();
                  setShowStoryModal(true);
                }}
                className="py-1 px-2.5 text-[8px] sm:text-[9px] font-pixel text-[#f0d060] bg-[#2d1b0e] hover:bg-[#3d2b1e] border border-[#8b6f4e] rounded-md flex items-center gap-1 cursor-pointer shadow"
              >
                <BookOpen size={12} weight="fill" />
                <span>Materi</span>
              </button>

              {isAlreadyCompleted ? (
                <div className="flex items-center gap-1 bg-[#14230f] border border-[#7ec850] rounded-md px-1.5 py-0.5">
                  <CheckCircle size={12} weight="fill" className="text-[#7ec850]" />
                  <span className="font-pixel text-[8px] text-[#7ec850]">Selesai</span>
                </div>
              ) : (
                <PixelBadge variant="gold" size="sm">
                  +250 XP
                </PixelBadge>
              )}
            </div>
          </div>

          {/* Spot Title Line with Stamp Icon */}
          <div className="flex items-center gap-2 border-t border-[#3d2b1e] pt-1.5">
            <div className="w-6 h-6 bg-[#170f07] border border-[#f0d060] rounded-md flex items-center justify-center shrink-0">
              <StampIcon name={booth.stampIcon} size={14} className="text-[#f0d060]" />
            </div>
            <h1 className="font-pixel text-[9px] sm:text-[11px] font-bold text-white leading-normal break-words flex-1">
              {booth.name}
            </h1>
          </div>
        </div>

        {/* Dynamic Mini-Game Arena (Fits available viewport without scroll) */}
        <div className="flex-1 sdv-card p-2.5 sm:p-4 flex flex-col justify-between overflow-hidden shadow-lg">
          <MiniGameContainer
            booth={booth}
            onComplete={handleMiniGameComplete}
            isCompleted={isAlreadyCompleted}
          />
        </div>
      </main>

      {/* Educational Story Lore Modal */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a0604]/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-gradient-to-b from-[#2d1b0e] to-[#170f07] border-[3px] border-[#f0d060] rounded-2xl p-4 sm:p-6 shadow-2xl relative max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#5a3a18] pb-2 mb-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-7 h-7 bg-[#170f07] border border-[#f0d060] rounded-md flex items-center justify-center shrink-0">
                  <StampIcon name={booth.stampIcon} size={16} className="text-[#f0d060]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[8px] font-pixel text-[#7ec850] uppercase block">
                    Materi Spot • {booth.code}
                  </span>
                  <h3 className="font-pixel text-[10px] sm:text-xs font-bold text-white leading-normal break-words">
                    {booth.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setShowStoryModal(false)}
                className="text-[#a08060] hover:text-[#f0d060] p-1 font-pixel text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex items-start gap-3 bg-[#170f07] p-3 rounded-xl border border-[#5a3a18] mb-4">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#281c12] border border-[#f0d060] shrink-0 relative">
                <Image
                  src={selectedAvatarObj.avatarImage}
                  alt={selectedAvatarObj.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <span className="font-pixel text-[9px] text-[#f0d060] block">
                  {participant.name}
                </span>
                <p className="font-sans text-xs text-[#f0e6d2] leading-relaxed text-justify break-words">
                  {booth.story}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (soundEnabled) soundEngine.playClick();
                setShowStoryModal(false);
              }}
              className="w-full rpg-btn-primary py-2.5 px-4 text-xs font-pixel font-bold"
            >
              TUTUP & MAINKAN MISI
            </button>
          </div>
        </div>
      )}

      {/* Stamp Award Celebration Modal */}
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        stampRecord={celebrationDetails.stampRecord}
        isFloorCompleted={celebrationDetails.isFloorCompleted}
        floorNumber={celebrationDetails.floorNumber}
        isLevelUp={celebrationDetails.isLevelUp}
        newLevel={celebrationDetails.newLevel}
        onNextAction={handleNextStep}
        nextActionLabel={
          isSpot1
            ? `Lanjut Spot 2 (${boothB.code})`
            : `Lantai ${floor.number} Tuntas!`
        }
      />
    </div>
  );
}
