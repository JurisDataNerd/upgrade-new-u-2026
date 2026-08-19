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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#5a3a18] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#170f07] border border-[#f0d060] rounded text-[#f0d060]">
            <MapPin size={18} weight="fill" />
          </div>
          <div>
            <h3 className="font-pixel text-xs sm:text-sm font-bold text-[#f0d060]">
              MINI-GAME: TEBAK POSISI SPOR KAMPUS
            </h3>
            <p className="font-sans text-xs text-[#c4956a]">
              Perhatikan foto spot gedung kampus, lalu pilih lokasi lantai/sayap yang tepat!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PixelBadge variant="cyan" size="sm">
            Spot {currentIndex + 1} dari {items.length}
          </PixelBadge>
        </div>
      </div>

      {/* Visual Photo Card */}
      <div className="sdv-card-gold overflow-hidden p-3 sm:p-4 space-y-3">
        <div className="relative w-full h-44 sm:h-56 rounded-xl overflow-hidden border-2 border-[#8b6f4e] shadow-md bg-[#120b06]">
          <Image
            src={currentItem.imageUrl || '/unu-hero.jpeg'}
            alt={currentItem.imageAlt || 'Spot Kampus UNU'}
            fill
            className="object-cover object-center filter brightness-[0.95]"
          />
          <div className="absolute top-2 left-2 bg-[#120b06]/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#f0d060] text-[9px] font-pixel text-[#f0d060] flex items-center gap-1.5 shadow">
            <Buildings size={14} weight="fill" className="text-[#7ec850]" />
            <span>GEDUNG 9 LANTAI UNU YOGYA</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#160d07]/80 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Prompt */}
        <div className="space-y-1 pt-1">
          <span className="font-pixel text-[9px] text-[#7ec850] uppercase tracking-wider">
            PERTANYAAN LOKASI:
          </span>
          <h4 className="font-sans text-xs sm:text-sm font-bold text-white leading-relaxed">
            {currentItem.prompt}
          </h4>
        </div>
      </div>

      {/* Multiple Choice Options */}
      <div className="space-y-2.5">
        <span className="font-pixel text-[9px] text-[#c4956a] uppercase px-1">
          Pilihan Lokasi Ruang / Fasilitas:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${optionClass}`}
              >
                <span className="font-pixel text-[10px] w-6 h-6 flex items-center justify-center rounded-md bg-[#281c12] text-[#f0d060] border border-[#5a3a18] shrink-0 mt-0.5 font-bold">
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="font-sans text-xs leading-relaxed flex-1">
                  {option}
                </span>
                {isRoundSubmitted &&
                  optIdx === currentItem.correctOptionIndex && (
                    <CheckCircle
                      size={18}
                      weight="fill"
                      className="text-[#7ec850] shrink-0"
                    />
                  )}
                {isRoundSubmitted && isSelected && !isSelectedCorrect && (
                  <XCircle
                    size={18}
                    weight="fill"
                    className="text-[#ff8080] shrink-0"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Card */}
      {isRoundSubmitted && (
        <div
          className={`p-4 rounded-xl border-2 space-y-2 animate-in fade-in ${
            isSelectedCorrect
              ? 'bg-[#14230f] border-[#7ec850] text-[#e0f0d0]'
              : 'bg-[#2d1210] border-[#d44040] text-[#ffd0d0]'
          }`}
        >
          <div className="flex items-center gap-2 font-pixel text-xs font-bold">
            {isSelectedCorrect ? (
              <>
                <CheckCircle size={18} weight="fill" className="text-[#7ec850]" />
                <span className="text-[#7ec850]">Lokasi Tepat Sekali!</span>
              </>
            ) : (
              <>
                <XCircle size={18} weight="fill" className="text-[#ff8080]" />
                <span className="text-[#ff8080]">Lokasi Belum Tepat</span>
              </>
            )}
          </div>
          <p className="font-sans text-xs leading-relaxed">
            {currentItem.explanation}
          </p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="border-t border-[#5a3a18] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs font-sans text-[#a08060]">
          {selectedOptionIndex !== null ? '1 opsi dipilih' : 'Pilih salah satu lokasi di atas'}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isRoundSubmitted ? (
            <button
              type="button"
              onClick={handleCheckAnswer}
              disabled={selectedOptionIndex === null}
              className="w-full sm:w-auto rpg-btn-primary py-3.5 px-8 text-xs font-pixel font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Check size={16} weight="bold" />
              <span>PILIH LOKASI INI</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextRound}
              className="w-full sm:w-auto rpg-btn-primary py-3.5 px-8 text-xs font-pixel font-bold flex items-center justify-center gap-2"
            >
              <span>
                {currentIndex < items.length - 1
                  ? 'Lanjut Spot Berikutnya'
                  : 'Selesaikan Mini-Game'}
              </span>
              <ArrowRight size={16} weight="bold" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
