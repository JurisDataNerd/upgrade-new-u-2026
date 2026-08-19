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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#5a3a18] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#170f07] border border-[#f0d060] rounded text-[#f0d060]">
            <Lightning size={18} weight="fill" />
          </div>
          <div>
            <h3 className="font-pixel text-xs sm:text-sm font-bold text-[#f0d060]">
              MINI-GAME: KUIS CEPAT DENGAN TIMER
            </h3>
            <p className="font-sans text-xs text-[#c4956a]">
              Pilih jawaban tepat sebelum waktu habis!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PixelBadge variant="gold" size="sm">
            Soal {currentIndex + 1} dari {questions.length}
          </PixelBadge>
        </div>
      </div>

      {/* Countdown Timer Bar */}
      <div className="bg-[#170f07] p-3 rounded-xl border-2 border-[#5a3a18] space-y-2">
        <div className="flex items-center justify-between font-pixel text-xs">
          <div className="flex items-center gap-1.5 text-[#f0d060]">
            <Timer size={16} weight="bold" />
            <span>SISA WAKTU:</span>
          </div>
          <span
            className={`font-mono text-sm font-bold ${
              timeLeft <= 5 ? 'text-[#ff8080] animate-bounce' : 'text-[#7ec850]'
            }`}
          >
            {timeLeft} DETIK
          </span>
        </div>

        {/* Progress Fill */}
        <div className="w-full h-3 bg-[#120b06] border border-[#5a3a18] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${timerColorClass}`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="sdv-card-elevated p-4 sm:p-5 border-2 border-[#5a3a18] space-y-3">
        <span className="font-pixel text-[9px] text-[#7ec850] uppercase tracking-wider">
          SOAL #{currentIndex + 1}
        </span>
        <h4 className="font-sans text-xs sm:text-sm font-bold text-white leading-relaxed">
          {currentQuestion.text}
        </h4>
      </div>

      {/* Multiple Choice Options */}
      <div className="space-y-2.5">
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
              className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 cursor-pointer ${optionClass}`}
            >
              <span className="font-pixel text-[10px] w-6 h-6 flex items-center justify-center rounded-md bg-[#281c12] text-[#f0d060] border border-[#5a3a18] shrink-0 mt-0.5 font-bold">
                {String.fromCharCode(65 + optIdx)}
              </span>
              <span className="font-sans text-xs leading-relaxed flex-1">
                {option}
              </span>
              {(isQuestionSubmitted || isTimeUp) &&
                optIdx === currentQuestion.correctAnswerIndex && (
                  <CheckCircle
                    size={18}
                    weight="fill"
                    className="text-[#7ec850] shrink-0"
                  />
                )}
              {isQuestionSubmitted && isSelected && !isCurrentCorrect && (
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

      {/* Feedback Card */}
      {(isQuestionSubmitted || isTimeUp) && (
        <div
          className={`p-4 rounded-xl border-2 space-y-2 animate-in fade-in ${
            isCurrentCorrect
              ? 'bg-[#14230f] border-[#7ec850] text-[#e0f0d0]'
              : 'bg-[#2d1210] border-[#d44040] text-[#ffd0d0]'
          }`}
        >
          <div className="flex items-center gap-2 font-pixel text-xs font-bold">
            {isTimeUp && !selectedOptionIndex ? (
              <>
                <Timer size={18} weight="fill" className="text-[#ff8080]" />
                <span className="text-[#ff8080]">Waktu Habis!</span>
              </>
            ) : isCurrentCorrect ? (
              <>
                <CheckCircle size={18} weight="fill" className="text-[#7ec850]" />
                <span className="text-[#7ec850]">Jawaban Tepat!</span>
              </>
            ) : (
              <>
                <XCircle size={18} weight="fill" className="text-[#ff8080]" />
                <span className="text-[#ff8080]">Jawaban Kurang Tepat</span>
              </>
            )}
          </div>
          <p className="font-sans text-xs leading-relaxed">
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="border-t border-[#5a3a18] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs font-sans text-[#a08060]">
          {selectedOptionIndex !== null
            ? 'Opsi dipilih, tekan Kirim Jawaban'
            : 'Pilih salah satu jawaban sebelum timer habis'}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isQuestionSubmitted && !isTimeUp ? (
            <button
              type="button"
              onClick={handleCheckAnswer}
              disabled={selectedOptionIndex === null}
              className="w-full sm:w-auto rpg-btn-primary py-3.5 px-8 text-xs font-pixel font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Check size={16} weight="bold" />
              <span>KIRIM JAWABAN CEPAT</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="w-full sm:w-auto rpg-btn-primary py-3.5 px-8 text-xs font-pixel font-bold flex items-center justify-center gap-2"
            >
              <span>
                {currentIndex < questions.length - 1
                  ? 'Lanjut Soal Berikutnya'
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
