'use client';

import React, { useState } from 'react';
import {
  Check,
  X,
  CheckCircle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Sparkle,
} from '@phosphor-icons/react';
import { BenarSalahContent } from '@/types/game';
import { soundEngine } from '@/lib/sound';
import { useGameStore } from '@/store/useGameStore';
import { PixelBadge } from '../ui/PixelBadge';

interface BenarSalahGameProps {
  content?: BenarSalahContent;
  onComplete: (score: number, totalQuestions: number) => void;
  isCompleted?: boolean;
}

export const BenarSalahGame: React.FC<BenarSalahGameProps> = ({
  content,
  onComplete,
  isCompleted = false,
}) => {
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const statements = content?.statements || [];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<boolean | null>(null);
  const [isRoundSubmitted, setIsRoundSubmitted] = useState<boolean>(false);
  const [totalScore, setTotalScore] = useState<number>(0);

  const currentStatement = statements[currentIndex];

  if (!currentStatement) {
    return (
      <div className="p-6 text-center font-sans text-xs text-[#c4956a]">
        Data soal Benar / Salah tidak ditemukan.
      </div>
    );
  }

  const handleAnswer = (choice: boolean) => {
    if (isRoundSubmitted) return;

    setSelectedChoice(choice);
    setIsRoundSubmitted(true);

    const isCorrect = choice === currentStatement.isCorrect;
    if (isCorrect) {
      if (soundEnabled) soundEngine.playCorrect();
      setTotalScore((prev) => prev + 1);
    } else {
      if (soundEnabled) soundEngine.playWrong();
    }
  };

  const handleNextStatement = () => {
    if (currentIndex < statements.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedChoice(null);
      setIsRoundSubmitted(false);
      if (soundEnabled) soundEngine.playClick();
    } else {
      const finalScore =
        selectedChoice === currentStatement.isCorrect
          ? totalScore + 1
          : totalScore;
      onComplete(finalScore, statements.length);
    }
  };

  const isUserCorrect =
    selectedChoice !== null && selectedChoice === currentStatement.isCorrect;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#5a3a18] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#170f07] border border-[#f0d060] rounded text-[#f0d060]">
            <ShieldCheck size={18} weight="fill" />
          </div>
          <div>
            <h3 className="font-pixel text-xs sm:text-sm font-bold text-[#f0d060]">
              MINI-GAME: UJI BENAR ATAU SALAH
            </h3>
            <p className="font-sans text-xs text-[#c4956a]">
              Evaluasi pernyataan berikut: tentukan BENAR atau SALAH secara tepat!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PixelBadge variant="emerald" size="sm">
            Pernyataan {currentIndex + 1} dari {statements.length}
          </PixelBadge>
        </div>
      </div>

      {/* Statement Card */}
      <div className="sdv-card-gold p-5 sm:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-[#5a3a18] pb-2">
          <span className="font-pixel text-[9px] text-[#7ec850] uppercase tracking-wider">
            PERNYATAAN #{currentIndex + 1}
          </span>
          <span className="font-pixel text-[9px] text-[#f0d060]">
            PILIH BENAR / SALAH
          </span>
        </div>

        <div className="bg-[#170f07] p-5 sm:p-6 border-2 border-[#5a3a18] rounded-xl shadow-inner text-center">
          <p className="font-sans text-sm sm:text-base font-semibold text-white leading-relaxed">
            &quot;{currentStatement.statement}&quot;
          </p>
        </div>

        {/* Big Tactile Dual Action Buttons */}
        {!isRoundSubmitted ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
            {/* BENAR Button */}
            <button
              type="button"
              onClick={() => handleAnswer(true)}
              className="py-4 px-6 rounded-xl border-3 border-[#7ec850] bg-gradient-to-b from-[#3d7828] to-[#255018] text-white font-pixel text-sm sm:text-base font-bold shadow-[0_5px_#122808] hover:translate-y-[-2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check size={22} weight="bold" className="text-[#f0d060]" />
              <span>BENAR</span>
            </button>

            {/* SALAH Button */}
            <button
              type="button"
              onClick={() => handleAnswer(false)}
              className="py-4 px-6 rounded-xl border-3 border-[#d44040] bg-gradient-to-b from-[#8b3a2b] to-[#5a1e14] text-white font-pixel text-sm sm:text-base font-bold shadow-[0_5px_#2d0a06] hover:translate-y-[-2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <X size={22} weight="bold" className="text-white" />
              <span>SALAH</span>
            </button>
          </div>
        ) : (
          /* Feedback Card */
          <div
            className={`p-4 sm:p-5 rounded-xl border-2 space-y-2 animate-in fade-in ${
              isUserCorrect
                ? 'bg-[#14230f] border-[#7ec850] text-[#e0f0d0]'
                : 'bg-[#2d1210] border-[#d44040] text-[#ffd0d0]'
            }`}
          >
            <div className="flex items-center gap-2 font-pixel text-xs font-bold">
              {isUserCorrect ? (
                <>
                  <CheckCircle size={18} weight="fill" className="text-[#7ec850]" />
                  <span className="text-[#7ec850]">
                    PILIHAN KAMU TEPAT! (Kunci: {currentStatement.isCorrect ? 'BENAR' : 'SALAH'})
                  </span>
                </>
              ) : (
                <>
                  <XCircle size={18} weight="fill" className="text-[#ff8080]" />
                  <span className="text-[#ff8080]">
                    Pilihan Kurang Tepat (Kunci: {currentStatement.isCorrect ? 'BENAR' : 'SALAH'})
                  </span>
                </>
              )}
            </div>
            <p className="font-sans text-xs leading-relaxed">
              {currentStatement.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-[#5a3a18] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs font-sans text-[#a08060]">
          {isRoundSubmitted
            ? 'Pernyataan telah dinilai'
            : 'Tekan tombol BENAR atau SALAH di atas'}
        </div>

        {isRoundSubmitted && (
          <button
            type="button"
            onClick={handleNextStatement}
            className="w-full sm:w-auto rpg-btn-primary py-3.5 px-8 text-xs font-pixel font-bold flex items-center justify-center gap-2"
          >
            <span>
              {currentIndex < statements.length - 1
                ? 'Lanjut Pernyataan Berikutnya'
                : 'Selesaikan Mini-Game'}
            </span>
            <ArrowRight size={16} weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
};
