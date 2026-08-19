'use client';

import React, { useState } from 'react';
import {
  Check,
  ArrowCounterClockwise,
  Lightbulb,
  Sparkle,
  ArrowRight,
  CheckCircle,
  XCircle,
} from '@phosphor-icons/react';
import { TebakKataContent } from '@/types/game';
import { soundEngine } from '@/lib/sound';
import { useGameStore } from '@/store/useGameStore';
import { PixelBadge } from '../ui/PixelBadge';

interface TebakKataGameProps {
  content?: TebakKataContent;
  onComplete: (score: number, totalQuestions: number) => void;
  isCompleted?: boolean;
}

export interface PlacedLetter {
  id: string; // unique tile id
  char: string;
  originalIndex: number;
}

export const TebakKataGame: React.FC<TebakKataGameProps> = ({
  content,
  onComplete,
  isCompleted = false,
}) => {
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const items = content?.items || [];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedLetters, setSelectedLetters] = useState<PlacedLetter[]>([]);
  const [usedTileIndices, setUsedTileIndices] = useState<number[]>([]);
  const [isRoundSubmitted, setIsRoundSubmitted] = useState<boolean>(false);
  const [isRoundCorrect, setIsRoundCorrect] = useState<boolean>(false);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);

  const currentItem = items[currentIndex];

  if (!currentItem) {
    return (
      <div className="p-6 text-center font-sans text-xs text-[#c4956a]">
        Data soal Tebak Kata tidak ditemukan.
      </div>
    );
  }

  const targetLength = currentItem.targetWord.length;
  const currentWordAttempt = selectedLetters.map((l) => l.char).join('');

  const handleSelectPoolTile = (char: string, index: number) => {
    if (isRoundSubmitted) return;
    if (selectedLetters.length >= targetLength) return;
    if (usedTileIndices.includes(index)) return;

    if (soundEnabled) soundEngine.playSelect();

    setSelectedLetters((prev) => [
      ...prev,
      { id: `${char}-${index}-${Date.now()}`, char, originalIndex: index },
    ]);
    setUsedTileIndices((prev) => [...prev, index]);
  };

  const handleRemovePlacedLetter = (letterIndex: number) => {
    if (isRoundSubmitted) return;
    const letterToRemove = selectedLetters[letterIndex];
    if (!letterToRemove) return;

    if (soundEnabled) soundEngine.playClick();

    setSelectedLetters((prev) => prev.filter((_, idx) => idx !== letterIndex));
    setUsedTileIndices((prev) =>
      prev.filter((origIdx) => origIdx !== letterToRemove.originalIndex)
    );
  };

  const handleClearAll = () => {
    if (isRoundSubmitted) return;
    setSelectedLetters([]);
    setUsedTileIndices([]);
    if (soundEnabled) soundEngine.playClick();
  };

  const handleCheckWord = () => {
    if (selectedLetters.length !== targetLength) return;

    const isMatch =
      currentWordAttempt.toUpperCase() === currentItem.targetWord.toUpperCase();
    setIsRoundSubmitted(true);
    setIsRoundCorrect(isMatch);

    if (isMatch) {
      if (soundEnabled) soundEngine.playCorrect();
      setTotalScore((prev) => prev + 1);
    } else {
      if (soundEnabled) soundEngine.playWrong();
    }
  };

  const handleNextRound = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedLetters([]);
      setUsedTileIndices([]);
      setIsRoundSubmitted(false);
      setIsRoundCorrect(false);
      setShowHint(false);
      if (soundEnabled) soundEngine.playClick();
    } else {
      const finalScore = isRoundCorrect ? totalScore + 1 : totalScore;
      onComplete(finalScore, items.length);
    }
  };

  const handleRetryRound = () => {
    setSelectedLetters([]);
    setUsedTileIndices([]);
    setIsRoundSubmitted(false);
    setIsRoundCorrect(false);
    if (soundEnabled) soundEngine.playClick();
  };

  const handleUseHint = () => {
    setShowHint(true);
    if (soundEnabled) soundEngine.playSelect();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#5a3a18] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#170f07] border border-[#f0d060] rounded text-[#f0d060]">
            <Sparkle size={18} weight="fill" />
          </div>
          <div>
            <h3 className="font-pixel text-xs sm:text-sm font-bold text-[#f0d060]">
              MINI-GAME: TEBAK KATA
            </h3>
            <p className="font-sans text-xs text-[#c4956a]">
              Susun huruf acak di bawah menjadi kata yang tepat sesuai petunjuk!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PixelBadge variant="gold" size="sm">
            Kata {currentIndex + 1} dari {items.length}
          </PixelBadge>
        </div>
      </div>

      {/* Clue Narrative Card */}
      <div className="sdv-card-elevated p-4 sm:p-5 border-2 border-[#5a3a18] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-pixel text-[9px] text-[#7ec850] uppercase tracking-wider">
            PETUNJUK KATA #{currentIndex + 1}
          </span>
          <span className="font-pixel text-[9px] text-[#f0d060]">
            Target: {targetLength} Huruf
          </span>
        </div>

        <p className="font-sans text-xs sm:text-sm text-white font-medium leading-relaxed">
          {currentItem.clue}
        </p>

        {showHint && currentItem.hint && (
          <div className="bg-[#170f07] p-2.5 rounded-lg border border-[#f0d060]/50 text-xs font-sans text-[#f0d060] flex items-center gap-2 animate-in fade-in">
            <Lightbulb size={16} weight="fill" className="shrink-0 text-[#f0d060]" />
            <span>
              <strong>Bantuan:</strong> {currentItem.hint}
            </span>
          </div>
        )}
      </div>

      {/* Answer Slots (Letter Boxes) */}
      <div className="space-y-2 text-center">
        <span className="font-pixel text-[9px] text-[#a08060] uppercase">
          Kotak Jawaban (Klik huruf di kotak untuk menghapus):
        </span>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 py-2">
          {Array.from({ length: targetLength }).map((_, idx) => {
            const letter = selectedLetters[idx];
            const isFilled = Boolean(letter);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => isFilled && handleRemovePlacedLetter(idx)}
                disabled={isRoundSubmitted}
                className={`w-11 h-12 sm:w-13 sm:h-14 rounded-xl border-2 font-pixel text-sm sm:text-base font-black transition-all flex items-center justify-center cursor-pointer ${
                  isFilled
                    ? isRoundSubmitted
                      ? isRoundCorrect
                        ? 'bg-[#1f3a2b] border-[#7ec850] text-[#7ec850] shadow-[0_0_12px_rgba(126,200,80,0.5)]'
                        : 'bg-[#3a1814] border-[#d44040] text-[#ff8080]'
                      : 'bg-gradient-to-b from-[#3d7828] to-[#255018] border-[#f0d060] text-white shadow-md hover:scale-105 active:scale-95'
                    : 'bg-[#170f07] border-dashed border-[#5a3a18] text-[#5a3a18]'
                }`}
              >
                {letter ? letter.char : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrambled Pool Tiles */}
      {!isRoundSubmitted && (
        <div className="space-y-2 text-center bg-[#170f07] p-4 rounded-xl border-2 border-[#5a3a18]">
          <span className="font-pixel text-[9px] text-[#c4956a] uppercase">
            Pilihan Huruf Tersedia (Klik untuk memasukkan):
          </span>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {currentItem.scrambledLetters.map((char, tileIdx) => {
              const isUsed = usedTileIndices.includes(tileIdx);

              return (
                <button
                  key={`${char}-${tileIdx}`}
                  type="button"
                  onClick={() => handleSelectPoolTile(char, tileIdx)}
                  disabled={isUsed}
                  className={`w-10 h-11 sm:w-12 sm:h-13 rounded-lg border-2 font-pixel text-xs sm:text-sm font-bold transition-all flex items-center justify-center cursor-pointer ${
                    isUsed
                      ? 'bg-[#120b06] border-[#3d2b1e] text-[#5a3a18] opacity-30 pointer-events-none'
                      : 'bg-[#281c12] border-[#8b6f4e] hover:border-[#f0d060] text-[#f0e0c0] hover:text-[#f0d060] active:scale-95 shadow-sm'
                  }`}
                >
                  {char}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={handleClearAll}
              disabled={selectedLetters.length === 0}
              className="py-1.5 px-3 text-[10px] font-pixel text-[#a08060] hover:text-[#f0d060] bg-[#23160c] border border-[#5a3a18] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <ArrowCounterClockwise size={12} weight="bold" />
              <span>Hapus Semua</span>
            </button>

            {!showHint && currentItem.hint && (
              <button
                type="button"
                onClick={handleUseHint}
                className="py-1.5 px-3 text-[10px] font-pixel text-[#f0d060] bg-[#2d1b0e] hover:bg-[#3d2b1e] border border-[#8b6f4e] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Lightbulb size={12} weight="bold" />
                <span>Buka Petunjuk</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Feedback Card after Round Check */}
      {isRoundSubmitted && (
        <div
          className={`p-4 sm:p-5 rounded-xl border-2 space-y-2 animate-in fade-in ${
            isRoundCorrect
              ? 'bg-[#14230f] border-[#7ec850] text-[#e0f0d0]'
              : 'bg-[#2d1210] border-[#d44040] text-[#ffd0d0]'
          }`}
        >
          <div className="flex items-center gap-2 font-pixel text-xs font-bold">
            {isRoundCorrect ? (
              <>
                <CheckCircle size={18} weight="fill" className="text-[#7ec850]" />
                <span className="text-[#7ec850]">
                  TEPAT SEKALI! KATA: {currentItem.targetWord}
                </span>
              </>
            ) : (
              <>
                <XCircle size={18} weight="fill" className="text-[#ff8080]" />
                <span className="text-[#ff8080]">Belum Tepat, Coba Lagi!</span>
              </>
            )}
          </div>
          <p className="font-sans text-xs leading-relaxed">
            {currentItem.explanation}
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div className="border-t border-[#5a3a18] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs font-sans text-[#c4956a]">
          {selectedLetters.length}/{targetLength} huruf terpasang
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isRoundSubmitted ? (
            <button
              type="button"
              onClick={handleCheckWord}
              disabled={selectedLetters.length !== targetLength}
              className="w-full sm:w-auto rpg-btn-primary py-3.5 px-8 text-xs font-pixel font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Check size={16} weight="bold" />
              <span>CEK KATA</span>
            </button>
          ) : isRoundCorrect ? (
            <button
              type="button"
              onClick={handleNextRound}
              className="w-full sm:w-auto rpg-btn-primary py-3.5 px-8 text-xs font-pixel font-bold flex items-center justify-center gap-2"
            >
              <span>
                {currentIndex < items.length - 1
                  ? 'Lanjut Kata Berikutnya'
                  : 'Selesaikan Mini-Game'}
              </span>
              <ArrowRight size={16} weight="bold" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRetryRound}
              className="w-full sm:w-auto rpg-btn-wood py-3.5 px-8 text-xs font-pixel font-bold flex items-center justify-center gap-2"
            >
              <ArrowCounterClockwise size={16} weight="bold" />
              <span>Coba Susun Ulang</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
