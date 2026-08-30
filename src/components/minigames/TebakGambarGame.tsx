'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  CheckCircle,
  XCircle,
  Images,
  ArrowRight,
  Check,
} from '@phosphor-icons/react';
import { TebakGambarContent } from '@/types/game';
import { soundEngine } from '@/lib/sound';
import { useGameStore } from '@/store/useGameStore';
import { PixelBadge } from '../ui/PixelBadge';

interface TebakGambarGameProps {
  content?: TebakGambarContent;
  onComplete: (score: number, totalQuestions: number) => void;
  isCompleted?: boolean;
}

export const TebakGambarGame: React.FC<TebakGambarGameProps> = ({
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
        Data soal Tebak Gambar tidak ditemukan.
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
    if (soundEnabled) soundEngine.playClick();
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsRoundSubmitted(false);
    } else {
      onComplete(totalScore, items.length);
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
            <Images size={14} weight="fill" />
          </div>
          <div>
            <h3 className="font-pixel text-[10px] sm:text-xs font-bold text-[#f0d060]">
              TEBAK GAMBAR
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <PixelBadge variant="cyan" size="sm">
            Soal {currentIndex + 1}/{items.length}
          </PixelBadge>
        </div>
      </div>

      {/* Picture Card & Prompt */}
      <div className="sdv-card-elevated overflow-hidden p-2 sm:p-2.5 space-y-1.5 shrink-0">
        <div className="relative w-full h-24 sm:h-32 rounded-lg overflow-hidden border border-[#8b6f4e] shadow bg-[#120b06]">
          {currentItem.imageUrl ? (
            <Image
              src={currentItem.imageUrl}
              alt={currentItem.imageAlt || 'Gambar Soal'}
              fill
              className="object-cover object-center filter brightness-[0.95]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-[#23160c] to-[#120b06] flex items-center justify-center">
              <span
                className="text-5xl sm:text-6xl leading-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] animate-pulse-glow select-none"
                role="img"
                aria-label={currentItem.imageAlt || 'Gambar soal'}
              >
                {currentItem.imageEmoji}
              </span>
            </div>
          )}
          <div className="absolute top-1.5 left-1.5 bg-[#120b06]/85 backdrop-blur-md px-1.5 py-0.5 rounded border border-[#f0d060] text-[8px] font-pixel text-[#f0d060] flex items-center gap-1 shadow">
            <Images size={10} weight="fill" className="text-[#7ec850]" />
            <span>PERHATIKAN GAMBAR</span>
          </div>
        </div>

        {/* Prompt */}
        <h4 className="font-sans text-[11px] sm:text-xs font-bold text-white leading-relaxed text-justify break-words">
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
                <span className="text-[#7ec850]">Jawaban Tepat Sekali!</span>
              </>
            ) : (
              <>
                <XCircle size={14} weight="fill" className="text-[#ff8080]" />
                <span className="text-[#ff8080]">Jawaban Belum Tepat</span>
              </>
            )}
          </div>
          <p className="font-sans text-[10px] sm:text-[11px] leading-relaxed text-justify break-words">
            {currentItem.explanation}
          </p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="border-t border-[#5a3a18] pt-1.5 flex items-center justify-between gap-2 shrink-0">
        <div className="text-[10px] font-sans text-[#a08060]">
          {selectedOptionIndex !== null ? '1 jawaban dipilih' : 'Pilih 1 jawaban'}
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
              <span>PILIH JAWABAN</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextRound}
              className="rpg-btn-primary py-2 px-4 text-[10px] sm:text-xs font-pixel font-bold flex items-center justify-center gap-1.5"
            >
              <span>
                {currentIndex < items.length - 1
                  ? 'Lanjut Soal'
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
