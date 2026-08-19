'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkle, Trophy, CheckCircle, ArrowRight } from '@phosphor-icons/react';
import { PixelButton } from './PixelButton';
import { PixelBadge } from './PixelBadge';
import { StampIcon } from './StampIcon';
import { soundEngine } from '@/lib/sound';
import { useGameStore } from '@/store/useGameStore';
import { StampRecord, PlayerLevel } from '@/types/game';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stampRecord?: StampRecord | null;
  isFloorCompleted?: boolean;
  floorNumber?: number;
  isLevelUp?: boolean;
  newLevel?: PlayerLevel;
  onNextAction?: () => void;
  nextActionLabel?: string;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  stampRecord,
  isFloorCompleted,
  floorNumber,
  isLevelUp,
  newLevel,
  onNextAction,
  nextActionLabel = 'Lanjut',
}) => {
  const soundEnabled = useGameStore((state) => state.soundEnabled);

  useEffect(() => {
    if (!isOpen) return;

    confetti({
      particleCount: isLevelUp ? 120 : 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#7ec850', '#f0d060', '#60a8d8', '#c4956a', '#ffffff'],
    });

    if (soundEnabled) {
      if (isLevelUp) {
        soundEngine.playLevelUp();
      } else {
        soundEngine.playStampSlam();
      }
    }
  }, [isOpen, isLevelUp, soundEnabled]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0604]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gradient-to-b from-[#2d1b0e] to-[#1a1008] border-[3.5px] border-[#f0d060] rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl">
        {/* Level Up Banner if applicable */}
        {isLevelUp && (
          <div className="mb-4 bg-[#14230f] border-2 border-[#7ec850] p-2.5 rounded-lg shadow-md animate-bounce">
            <div className="flex items-center justify-center gap-2 font-pixel text-xs text-[#f0d060]">
              <Trophy size={16} weight="fill" className="text-[#f0d060]" />
              <span>Naik Level! → {newLevel}</span>
            </div>
          </div>
        )}

        {/* Floor Completed Banner */}
        {isFloorCompleted && !isLevelUp && (
          <div className="mb-4 bg-[#14230f] border-2 border-[#7ec850] p-2.5 rounded-lg shadow-md">
            <div className="flex items-center justify-center gap-1.5 font-pixel text-xs text-[#7ec850]">
              <Sparkle size={16} weight="fill" className="text-[#f0d060]" />
              <span>Lantai {floorNumber} Selesai!</span>
            </div>
          </div>
        )}

        {/* Stamp Graphic */}
        <div className="my-4 flex justify-center items-center">
          <div className="relative">
            <div className="w-28 h-28 rounded-xl border-3 border-[#f0d060] bg-gradient-to-b from-[#3d7828] to-[#255018] shadow-md flex flex-col items-center justify-center p-2 animate-stamp-slam rotate-[-2deg]">
              <StampIcon
                name={stampRecord?.stampIcon || 'Sparkle'}
                size={34}
                className="text-[#f0d060] mb-1"
              />
              <span className="font-pixel text-[8px] text-[#f0d060] uppercase font-bold tracking-wider">
                {stampRecord?.stampTitle || 'STEMPEL RESMI'}
              </span>
              <span className="font-mono text-[7px] text-[#e0f0d0] mt-0.5">
                GENIUS UNU YOGYA
              </span>
            </div>
          </div>
        </div>

        {/* Text Details */}
        <h3 className="font-pixel text-sm sm:text-base font-bold text-white mb-1">
          {stampRecord?.boothName || 'Spot Selesai!'}
        </h3>
        <p className="text-xs text-[#d0c0a0] mb-4 leading-relaxed font-sans">
          Kamu berhasil menyelesaikan tantangan dan mendapatkan stempel resmi.
        </p>

        <div className="flex items-center justify-center gap-3 mb-6">
          <PixelBadge variant="emerald" size="sm">
            <CheckCircle size={14} weight="bold" /> Skor: {stampRecord?.score ?? 2}/{stampRecord?.totalQuestions ?? 2}
          </PixelBadge>
          <PixelBadge variant="gold" size="sm">
            +250 XP
          </PixelBadge>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <PixelButton
            variant="wood"
            size="md"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Lihat Paspor
          </PixelButton>
          <PixelButton
            variant="primary"
            size="md"
            onClick={() => {
              if (onNextAction) {
                onNextAction();
              } else {
                onClose();
              }
            }}
            icon={<ArrowRight size={16} weight="bold" />}
            className="w-full sm:w-auto"
          >
            {nextActionLabel}
          </PixelButton>
        </div>
      </div>
    </div>
  );
};
