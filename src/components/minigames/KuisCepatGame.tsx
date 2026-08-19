'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  CheckCircle,
  XCircle,
  ArrowRight,
  Check,
  Lightning,
} from '@phosphor-icons/react';
import { KuisCepatContent, Question } from '@/types/game';
import { soundEngine } from '@/lib/sound';
import { useGameStore } from '@/store/useGameStore';
import { PixelBadge } from '../ui/PixelBadge';

interface KuisCepatGameProps {
  content?: KuisCepatContent;
  fallbackQuestions?: Question[];
  onComplete: (score: number, totalQuestions: number) => void;
  isCompleted?: boolean;
}

export const KuisCepatGame: React.FC<KuisCepatGameProps> = ({
  content,
  fallbackQuestions,
  onComplete,
  isCompleted = false,
}) => {
  const soundEnabled = useGameStore((state) => state.soundEnabled);

  const questions = content?.questions || fallbackQuestions || [];
  const timeLimit = content?.timeLimitSeconds || 18;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isQuestionSubmitted, setIsQuestionSubmitted] = useState<boolean>(false);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const [totalScore, setTotalScore] = useState<number>(0);

  const currentQuestion = questions[currentIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (isQuestionSubmitted || isCompleted || !currentQuestion) return;

    setTimeLeft(timeLimit);
    setIsTimeUp(false);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsTimeUp(true);
          setIsQuestionSubmitted(true);
          if (soundEnabled) soundEngine.playWrong();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isQuestionSubmitted, isCompleted]);

  if (!currentQuestion) {
    return (
      <div className="p-6 text-center font-sans text-xs text-[#c4956a]">
        Data soal Kuis Cepat tidak ditemukan.
      </div>
    );
  }

  const handleSelectOption = (index: number) => {
    if (isQuestionSubmitted || isTimeUp) return;
    if (soundEnabled) soundEngine.playSelect();
    setSelectedOptionIndex(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOptionIndex === null || isQuestionSubmitted) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setIsQuestionSubmitted(true);

    const isCorrect = selectedOptionIndex === currentQuestion.correctAnswerIndex;
    if (isCorrect) {
      if (soundEnabled) soundEngine.playCorrect();
      setTotalScore((prev) => prev + 1);
    } else {
      if (soundEnabled) soundEngine.playWrong();
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsQuestionSubmitted(false);
      setIsTimeUp(false);
      if (soundEnabled) soundEngine.playClick();
    } else {
      const finalScore =
        selectedOptionIndex === currentQuestion.correctAnswerIndex
          ? totalScore + 1
          : totalScore;
      onComplete(finalScore, questions.length);
    }
  };

  const isCurrentCorrect =
    selectedOptionIndex === currentQuestion.correctAnswerIndex;

  const timerPercentage = (timeLeft / timeLimit) * 100;
  const timerColorClass =
    timeLeft > timeLimit * 0.5
      ? 'bg-[#7ec850]'
      : timeLeft > timeLimit * 0.25
      ? 'bg-[#f0d060]'
      : 'bg-[#d44040] animate-pulse';

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden gap-1.5 sm:gap-2 select-none">
      {/* Top Compact Timer & Question Count Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#5a3a18] pb-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-[#170f07] border border-[#f0d060] rounded text-[#f0d060]">
            <Lightning size={14} weight="fill" />
          </div>
          <div>
            <h3 className="font-pixel text-[10px] sm:text-xs font-bold text-[#f0d060]">
              KUIS CEPAT
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timer Display */}
          <div className="flex items-center gap-1 bg-[#170f07] border border-[#5a3a18] px-2 py-0.5 rounded-md text-[10px] font-pixel">
            <Timer size={12} weight="bold" className="text-[#f0d060]" />
            <span
              className={`font-mono font-bold ${
                timeLeft <= 5 ? 'text-[#ff8080] animate-bounce' : 'text-[#7ec850]'
              }`}
            >
              {timeLeft}s
            </span>
          </div>

          <PixelBadge variant="gold" size="sm">
            {currentIndex + 1}/{questions.length}
          </PixelBadge>
        </div>
      </div>

      {/* Countdown Timer Line Bar */}
      <div className="w-full h-1.5 bg-[#120b06] border border-[#5a3a18] rounded-full overflow-hidden shrink-0">
        <div
          className={`h-full transition-all duration-1000 ${timerColorClass}`}
          style={{ width: `${timerPercentage}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="sdv-card-elevated p-2.5 sm:p-3 border border-[#5a3a18] shrink-0">
        <span className="font-pixel text-[8px] text-[#7ec850] uppercase tracking-wider block mb-1">
          SOAL #{currentIndex + 1}:
        </span>
        <h4 className="font-sans text-xs sm:text-sm font-bold text-white leading-snug">
          {currentQuestion.text}
        </h4>
      </div>

      {/* Multiple Choice Options (Grid 2 cols on tablet / 1 col on mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 flex-1 overflow-y-auto py-0.5">
        {currentQuestion.options.map((option, optIdx) => {
          const isSelected = selectedOptionIndex === optIdx;
          let optionClass =
            'bg-[#170f07] border-[#5a3a18] text-[#f0e0c0] hover:border-[#8b6f4e]';

          if (isQuestionSubmitted || isTimeUp) {
            if (optIdx === currentQuestion.correctAnswerIndex) {
              optionClass =
                'bg-[#1f3a2b] border-[#7ec850] text-[#e0f0d0] shadow-md font-medium';
            } else if (isSelected && !isCurrentCorrect) {
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
              disabled={isQuestionSubmitted || isTimeUp}
              className={`w-full text-left p-2 sm:p-2.5 rounded-lg border transition-all flex items-center gap-2 cursor-pointer ${optionClass}`}
            >
              <span className="font-pixel text-[9px] w-5 h-5 flex items-center justify-center rounded bg-[#281c12] text-[#f0d060] border border-[#5a3a18] shrink-0 font-bold">
                {String.fromCharCode(65 + optIdx)}
              </span>
              <span className="font-sans text-[11px] sm:text-xs leading-tight flex-1">
                {option}
              </span>
              {(isQuestionSubmitted || isTimeUp) &&
                optIdx === currentQuestion.correctAnswerIndex && (
                  <CheckCircle
                    size={16}
                    weight="fill"
                    className="text-[#7ec850] shrink-0"
                  />
                )}
              {isQuestionSubmitted && isSelected && !isCurrentCorrect && (
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

      {/* Feedback Alert Card */}
      {(isQuestionSubmitted || isTimeUp) && (
        <div
          className={`p-2 rounded-lg border text-left animate-in fade-in shrink-0 ${
            isCurrentCorrect
              ? 'bg-[#14230f] border-[#7ec850] text-[#e0f0d0]'
              : 'bg-[#2d1210] border-[#d44040] text-[#ffd0d0]'
          }`}
        >
          <div className="flex items-center gap-1.5 font-pixel text-[10px] font-bold">
            {isTimeUp && !selectedOptionIndex ? (
              <>
                <Timer size={14} weight="fill" className="text-[#ff8080]" />
                <span className="text-[#ff8080]">Waktu Habis!</span>
              </>
            ) : isCurrentCorrect ? (
              <>
                <CheckCircle size={14} weight="fill" className="text-[#7ec850]" />
                <span className="text-[#7ec850]">Jawaban Tepat!</span>
              </>
            ) : (
              <>
                <XCircle size={14} weight="fill" className="text-[#ff8080]" />
                <span className="text-[#ff8080]">Kurang Tepat!</span>
              </>
            )}
          </div>
          <p className="font-sans text-[10px] sm:text-[11px] leading-snug mt-0.5 break-words">
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="border-t border-[#5a3a18] pt-1.5 flex items-center justify-between gap-2 shrink-0">
        <div className="text-[10px] font-sans text-[#a08060]">
          {selectedOptionIndex !== null ? 'Siap dikirim' : 'Pilih 1 jawaban'}
        </div>

        <div className="shrink-0">
          {!isQuestionSubmitted && !isTimeUp ? (
            <button
              type="button"
              onClick={handleCheckAnswer}
              disabled={selectedOptionIndex === null}
              className="rpg-btn-primary py-2 px-4 text-[10px] sm:text-xs font-pixel font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Check size={14} weight="bold" />
              <span>KIRIM JAWABAN</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="rpg-btn-primary py-2 px-4 text-[10px] sm:text-xs font-pixel font-bold flex items-center justify-center gap-1.5"
            >
              <span>
                {currentIndex < questions.length - 1
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
