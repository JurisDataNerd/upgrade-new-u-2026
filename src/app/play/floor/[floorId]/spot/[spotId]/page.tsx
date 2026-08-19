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

  return (
    <div className="min-h-screen flex flex-col bg-[#2d1b0e] text-[#f0e0c0]">
      <CrtScanlines />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href={`/play/floor/${floor.number}/intro`}
            onClick={() => soundEnabled && soundEngine.playClick()}
            className="inline-flex items-center gap-2 text-xs font-pixel text-[#c4956a] hover:text-[#f0d060] transition-colors"
          >
            <ArrowLeft size={16} weight="bold" />
            <span>Kembali</span>
          </Link>

          <div className="flex items-center gap-2">
            <PixelBadge variant="wood" size="sm">
              Lantai {floor.number}
            </PixelBadge>
            <PixelBadge variant="gold" size="sm">
              Spot {isSpot1 ? '1' : '2'} • {booth.code}
            </PixelBadge>
          </div>
        </div>

        {/* Spot Information Header */}
        <div className="sdv-card-gold p-5 sm:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#5a3a18] pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 bg-[#170f07] border-2 border-[#f0d060] rounded-xl flex items-center justify-center shadow-inner shrink-0">
                <StampIcon name={booth.stampIcon} size={28} className="text-[#f0d060]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-[9px] text-[#7ec850] uppercase">
                    {floor.name.split(' - ')[1] || floor.name}
                  </span>
                  <PixelBadge variant="gold" size="sm">
                    {booth.badgeTag}
                  </PixelBadge>
                </div>
                <h1 className="font-pixel text-sm sm:text-base font-bold text-white mt-1">
                  {booth.name}
                </h1>
              </div>
            </div>

            {/* Stamp Status Marker */}
            {isAlreadyCompleted && (
              <div className="flex items-center gap-2 bg-[#14230f] border border-[#7ec850] rounded-full px-3 py-1 shadow-sm">
                <CheckCircle size={16} weight="fill" className="text-[#7ec850]" />
                <span className="font-pixel text-[9px] text-[#7ec850] font-bold">
                  Selesai
                </span>
              </div>
            )}
          </div>

          {/* Educational Story Box */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-pixel text-xs text-[#f0d060]">
              <BookOpen size={16} weight="fill" />
              <span>Materi Spot</span>
            </div>

            <div className="bg-[#170f07] p-4 sm:p-5 border-2 border-[#5a3a18] rounded-xl relative shadow-inner">
              <div className="flex items-start gap-4">
                <div className="w-13 h-13 rounded-xl overflow-hidden bg-[#281c12] border-2 border-[#f0d060] shrink-0 relative shadow-md">
                  <Image
                    src={selectedAvatarObj.avatarImage}
                    alt={selectedAvatarObj.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="font-pixel text-[9px] text-[#7ec850] flex items-center gap-1.5">
                    <span>{participant.name}</span>
                  </div>
                  <p className="font-sans text-xs sm:text-sm text-[#f0e6d2] leading-relaxed">
                    {booth.story}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Mini-Game Arena */}
        <div className="sdv-card p-5 sm:p-7">
          <MiniGameContainer
            booth={booth}
            onComplete={handleMiniGameComplete}
            isCompleted={isAlreadyCompleted}
          />
        </div>
      </main>

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
            ? `Lanjut ke Spot 2 (${boothB.code})`
            : `Evaluasi Lantai ${floor.number} Tuntas!`
        }
      />
    </div>
  );
}
