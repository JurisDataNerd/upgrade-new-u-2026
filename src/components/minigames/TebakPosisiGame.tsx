'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Sparkle,
  CheckCircle,
  XCircle,
  MapPin,
  ArrowRight,
  Check,
  Buildings,
} from '@phosphor-icons/react';
import { TebakPosisiContent } from '@/types/game';
import { soundEngine } from '@/lib/sound';
import { useGameStore } from '@/store/useGameStore';
import { PixelBadge } from '../ui/PixelBadge';

interface TebakPosisiGameProps {
  content?: TebakPosisiContent;
  onComplete: (score: number, totalQuestions: number) => void;
  isCompleted?: boolean;
}

export const TebakPosisiGame: React.FC<TebakPosisiGameProps> = ({
  content,
  onComplete,
  isCompleted = false,
}) => {
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const items = content?.items || [];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isRoundSubmitted, setIsRoundSubmitted] = useState<boolean>(false);
  const [totalScore, setTotalScore] = useState<number>(0);

  const currentItem = items[currentIndex];

  if (!currentItem) {
    return (
      <div className="p-6 text-center font-sans text-xs text-[#c4956a]">
        Data soal Tebak Posisi tidak ditemukan.
      </div>
    );
  }

  const handleSelectOption = (idx: number) => {
    if (isRoundSubmitted) return;
    if (soundEnabled) soundEngine.playSelect();
    setSelectedOptionIndex(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOptionIndex === null) return;

    const isCorrect = selectedOptionIndex === currentItem.correctOptionIndex;
    setIsRoundSubmitted(true);

    if (isCorrect) {
      if (soundEnabled) soundEngine.playCorrect();
      setTotalScore((prev) => prev + 1);
    } else {
      if (soundEnabled) soundEngine.playWrong();
    }
  };

  const handleNextRound = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsRoundSubmitted(false);
      if (soundEnabled) soundEngine.playClick();
    } else {
      const finalScore =
        selectedOptionIndex === currentItem.correctOptionIndex
          ? totalScore + 1
          : totalScore;
      onComplete(finalScore, items.length);
    }
  };

  const isSelectedCorrect =
    selectedOptionIndex === currentItem.correctOptionIndex;

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden gap-1.5 sm:gap-2 select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#5a3a18] pb-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-[#170f07] border border-[#f0d060] rounded text-[#f0d060]">
            <MapPin size={14} weight="fill" />
          </div>
          <div>
            <h3 className="font-pixel text-[10px] sm:text-xs font-bold text-[#f0d060]">
              TEBAK POSISI
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <PixelBadge variant="cyan" size="sm">
            Spot {currentIndex + 1}/{items.length}
          </PixelBadge>
        </div>
      </div>

      {/* Visual Photo & Prompt Card */}
      <div className="sdv-card-elevated overflow-hidden p-2 sm:p-2.5 space-y-1.5 shrink-0">
        <div className="relative w-full h-24 sm:h-32 rounded-lg overflow-hidden border border-[#8b6f4e] shadow bg-[#120b06]">
          <Image
            src={currentItem.imageUrl || '/unu-hero.jpeg'}
            alt={currentItem.imageAlt || 'Spot Kampus UNU'}
            fill
            className="object-cover object-center filter brightness-[0.95]"
          />
          <div className="absolute top-1.5 left-1.5 bg-[#120b06]/85 backdrop-blur-md px-1.5 py-0.5 rounded border border-[#f0d060] text-[8px] font-pixel text-[#f0d060] flex items-center gap-1 shadow">
            <Buildings size={10} weight="fill" className="text-[#7ec850]" />
            <span>KAMPUS UNU</span>
          </div>
        </div>

        {/* Prompt */}
        <h4 className="font-sans text-[11px] sm:text-xs font-bold text-white leading-snug break-words">
          {currentItem.prompt}
        </h4>
      </div>

      {/* Multiple Choice Options (2x2 grid) */}
      <div className="grid grid-cols-2 gap-1.5 flex-1 overflow-y-auto py-0.5">
        {currentItem.options.map((option, optIdx) => {
          const isSelected = selectedOptionIndex === optIdx;
          let optionClass =
            'bg-[#170f07] border-[#5a3a18] text-[#f0e0c0] hover:border-[#8b6f4e]';

          if (isRoundSubmitted) {
            if (optIdx === currentItem.correctOptionIndex) {
              optionClass =
                'bg-[#1f3a2b] border-[#7ec850] text-[#e0f0d0] shadow-md font-medium';
            } else if (isSelected && !isSelectedCorrect) {
              optionClass =
                'bg-[#3a1814] border-[#d44040] text-[#ffd0d0] shadow-md';
            }
          } else if (isSelected) {
            optionClass =
              'bg-[#2d1b0e] border-[#f0d060] text-white shadow-md font-medium';
          }

          return (
            <button
              key={optIdx}
              type="button"
              onClick={() => handleSelectOption(optIdx)}
              disabled={isRoundSubmitted}
              className={`p-2 sm:p-2.5 rounded-lg border text-left transition-all flex items-center gap-1.5 cursor-pointer ${optionClass}`}
            >
              <span className="font-pixel text-[9px] w-5 h-5 flex items-center justify-center rounded bg-[#281c12] text-[#f0d060] border border-[#5a3a18] shrink-0 font-bold">
                {String.fromCharCode(65 + optIdx)}
              </span>
              <span className="font-sans text-[11px] sm:text-xs leading-tight flex-1 break-words">
                {option}
              </span>
              {isRoundSubmitted &&
                optIdx === currentItem.correctOptionIndex && (
                  <CheckCircle
                    size={16}
                    weight="fill"
                    className="text-[#7ec850] shrink-0"
                  />
                )}
              {isRoundSubmitted && isSelected && !isSelectedCorrect && (
                <XCircle
                  size={16}
                  weight="fill"
                  className="text-[#ff8080] shrink-0"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback Card */}
      {isRoundSubmitted && (
        <div
          className={`p-2 rounded-lg border space-y-0.5 animate-in fade-in shrink-0 ${
            isSelectedCorrect
              ? 'bg-[#14230f] border-[#7ec850] text-[#e0f0d0]'
              : 'bg-[#2d1210] border-[#d44040] text-[#ffd0d0]'
          }`}
        >
          <div className="flex items-center gap-1 font-pixel text-[10px] font-bold">
            {isSelectedCorrect ? (
              <>
                <CheckCircle size={14} weight="fill" className="text-[#7ec850]" />
                <span className="text-[#7ec850]">Lokasi Tepat Sekali!</span>
              </>
            ) : (
              <>
                <XCircle size={14} weight="fill" className="text-[#ff8080]" />
                <span className="text-[#ff8080]">Lokasi Belum Tepat</span>
              </>
            )}
          </div>
          <p className="font-sans text-[10px] sm:text-[11px] leading-snug break-words">
            {currentItem.explanation}
          </p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="border-t border-[#5a3a18] pt-1.5 flex items-center justify-between gap-2 shrink-0">
        <div className="text-[10px] font-sans text-[#a08060]">
          {selectedOptionIndex !== null ? '1 lokasi dipilih' : 'Pilih 1 lokasi'}
        </div>

        <div className="shrink-0">
          {!isRoundSubmitted ? (
            <button
              type="button"
              onClick={handleCheckAnswer}
              disabled={selectedOptionIndex === null}
              className="rpg-btn-primary py-2 px-4 text-[10px] sm:text-xs font-pixel font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Check size={14} weight="bold" />
              <span>PILIH LOKASI</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextRound}
              className="rpg-btn-primary py-2 px-4 text-[10px] sm:text-xs font-pixel font-bold flex items-center justify-center gap-1.5"
            >
              <span>
                {currentIndex < items.length - 1
                  ? 'Lanjut Spot'
                  : 'Selesai'}
              </span>
              <ArrowRight size={14} weight="bold" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
