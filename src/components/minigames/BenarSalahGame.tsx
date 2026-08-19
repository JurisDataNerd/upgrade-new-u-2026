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
    <div className="h-full flex flex-col justify-between overflow-hidden gap-1.5 sm:gap-2 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#5a3a18] pb-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-[#170f07] border border-[#f0d060] rounded text-[#f0d060]">
            <ShieldCheck size={14} weight="fill" />
          </div>
          <div>
            <h3 className="font-pixel text-[10px] sm:text-xs font-bold text-[#f0d060]">
              UJI BENAR / SALAH
            </h3>
          </div>
        </div>

        <PixelBadge variant="emerald" size="sm">
          Pernyataan {currentIndex + 1}/{statements.length}
        </PixelBadge>
      </div>

      {/* Statement Card */}
      <div className="sdv-card-elevated p-3 sm:p-4 space-y-2 flex-1 flex flex-col justify-center text-center">
        <div className="flex items-center justify-between border-b border-[#5a3a18] pb-1">
          <span className="font-pixel text-[8px] text-[#7ec850] uppercase tracking-wider">
            PERNYATAAN #{currentIndex + 1}
          </span>
          <span className="font-pixel text-[8px] text-[#f0d060]">
            PILIH BENAR / SALAH
          </span>
        </div>

        <div className="bg-[#170f07] p-3 sm:p-4 border border-[#5a3a18] rounded-xl shadow-inner my-auto">
          <p className="font-sans text-xs sm:text-sm font-semibold text-white leading-relaxed">
            &ldquo;{currentStatement.statement}&rdquo;
          </p>
        </div>

        {/* Dual Action Buttons */}
        {!isRoundSubmitted ? (
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* BENAR Button */}
            <button
              type="button"
              onClick={() => handleAnswer(true)}
              className="py-3 px-4 rounded-xl border-2 border-[#7ec850] bg-gradient-to-b from-[#3d7828] to-[#255018] text-white font-pixel text-xs sm:text-sm font-bold shadow-[0_3px_#122808] hover:translate-y-[-1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check size={18} weight="bold" className="text-[#f0d060]" />
              <span>BENAR</span>
            </button>

            {/* SALAH Button */}
            <button
              type="button"
              onClick={() => handleAnswer(false)}
              className="py-3 px-4 rounded-xl border-2 border-[#d44040] bg-gradient-to-b from-[#8b3a2b] to-[#5a1e14] text-white font-pixel text-xs sm:text-sm font-bold shadow-[0_3px_#2d0a06] hover:translate-y-[-1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <X size={18} weight="bold" className="text-white" />
              <span>SALAH</span>
            </button>
          </div>
        ) : (
          /* Feedback Card */
          <div
            className={`p-2.5 rounded-xl border text-left space-y-1 animate-in fade-in ${
              isUserCorrect
                ? 'bg-[#14230f] border-[#7ec850] text-[#e0f0d0]'
                : 'bg-[#2d1210] border-[#d44040] text-[#ffd0d0]'
            }`}
          >
            <div className="flex items-center gap-1.5 font-pixel text-[10px] font-bold">
              {isUserCorrect ? (
                <>
                  <CheckCircle size={14} weight="fill" className="text-[#7ec850]" />
                  <span className="text-[#7ec850]">
                    PILIHAN TEPAT! (Kunci: {currentStatement.isCorrect ? 'BENAR' : 'SALAH'})
                  </span>
                </>
              ) : (
                <>
                  <XCircle size={14} weight="fill" className="text-[#ff8080]" />
                  <span className="text-[#ff8080]">
                    Kurang Tepat (Kunci: {currentStatement.isCorrect ? 'BENAR' : 'SALAH'})
                  </span>
                </>
              )}
            </div>
            <p className="font-sans text-[10px] sm:text-[11px] leading-snug break-words">
              {currentStatement.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-[#5a3a18] pt-1.5 flex items-center justify-between gap-2 shrink-0">
        <div className="text-[10px] font-sans text-[#a08060]">
          {isRoundSubmitted
            ? 'Pernyataan dinilai'
            : 'Pilih BENAR atau SALAH'}
        </div>

        {isRoundSubmitted && (
          <button
            type="button"
            onClick={handleNextStatement}
            className="rpg-btn-primary py-2 px-4 text-[10px] sm:text-xs font-pixel font-bold flex items-center justify-center gap-1.5"
          >
            <span>
              {currentIndex < statements.length - 1
                ? 'Lanjut Soal'
                : 'Selesai'}
            </span>
            <ArrowRight size={14} weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
};
