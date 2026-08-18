'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkle, Trophy, CheckCircle, ArrowRight } from '@phosphor-icons/react';
import { PixelButton } from './PixelButton';
import { PixelBadge } from './PixelBadge';
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
  nextActionLabel = 'Lanjut Eksplorasi',
}) => {
  const soundEnabled = useGameStore((state) => state.soundEnabled);

  useEffect(() => {
    if (!isOpen) return;

    // Trigger celebratory confetti burst
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
      <div className="w-full max-w-md bg-gradient-to-b from-[#2d1b0e] to-[#1a1008] border-[3.5px] border-[#f0d060] rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden shadow-[inset_0_0_0_3px_#6b4f2e,0_16px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(240,208,96,0.25)]">
        {/* Decorative corner tags */}
        <div className="absolute top-3 left-4 text-[9px] font-pixel text-[#7ec850] tracking-wider">
          ★ VICTORY ★
        </div>
        <div className="absolute top-3 right-4 text-[9px] font-pixel text-[#f0d060] tracking-wider">
          +XP EARNED
        </div>

        {/* Level Up Banner if applicable */}
        {isLevelUp && (
          <div className="mb-4 bg-[#14230f] border-2 border-[#7ec850] p-2.5 rounded-lg shadow-md animate-bounce">
            <div className="flex items-center justify-center gap-2 font-pixel text-xs text-[#f0d060]">
              <Trophy size={16} weight="fill" className="text-[#f0d060]" />
              <span>LEVEL UP! → {newLevel}</span>
            </div>
          </div>
        )}

        {/* Floor Completed Banner */}
        {isFloorCompleted && !isLevelUp && (
          <div className="mb-4 bg-[#14230f] border-2 border-[#7ec850] p-2.5 rounded-lg shadow-md">
            <div className="flex items-center justify-center gap-1.5 font-pixel text-xs text-[#7ec850]">
              <Sparkle size={16} weight="fill" className="text-[#f0d060]" />
              <span>LANTAI {floorNumber} TUNTAS 100%!</span>
            </div>
          </div>
        )}

        {/* Stamp Graphic with Slam Animation */}
        <div className="my-5 flex justify-center items-center">
          <div className="relative">
            {/* Stamp Outer Wax/Border Seal */}
            <div className="w-32 h-32 rounded-xl border-3 border-[#f0d060] bg-gradient-to-b from-[#3d7828] to-[#255018] shadow-[inset_0_0_0_2px_#7ec850,0_8px_20px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center p-3 animate-stamp-slam rotate-[-3deg]">
              <span className="text-4xl select-none mb-1">{stampRecord?.stampIcon || '🌟'}</span>
              <span className="font-pixel text-[9px] text-[#f0d060] uppercase leading-tight font-bold tracking-wider">
                {stampRecord?.stampTitle || 'STEMPEL RESMI'}
              </span>
              <span className="font-mono text-[8px] text-[#e0f0d0] mt-1">
                GENIUS • UNU YOGYA
              </span>
            </div>
            {/* Verified Stamp Badge */}
            <div className="absolute -bottom-2 -right-2 bg-[#f0d060] text-[#1b120a] border border-[#6b4f2e] px-2 py-0.5 text-[9px] font-pixel font-bold rounded shadow-md">
              TERVERIFIKASI
            </div>
          </div>
        </div>

        {/* Text Details */}
        <h3 className="font-pixel text-sm sm:text-base font-bold text-white mb-1">
          {stampRecord?.boothName || 'Booth Selesai!'}
        </h3>
        <p className="text-xs sm:text-sm text-[#d0c0a0] mb-4 leading-relaxed font-sans">
          Selamat! Kamu berhasil menyelesaikan kuis dan mengoleksi stempel karakter untuk paspor digitalmu.
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
