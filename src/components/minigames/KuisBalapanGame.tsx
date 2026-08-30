'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  FlagCheckered,
  ArrowRight,
  Check,
  Timer,
} from '@phosphor-icons/react';
import { KuisBalapanContent } from '@/types/game';
import { soundEngine } from '@/lib/sound';
import { useGameStore } from '@/store/useGameStore';
import { PixelBadge } from '../ui/PixelBadge';

interface KuisBalapanGameProps {
  content?: KuisBalapanContent;
  onComplete: (score: number, totalQuestions: number) => void;
  isCompleted?: boolean;
}

const TICK_MS = 100;

export const KuisBalapanGame: React.FC<KuisBalapanGameProps> = ({
  content,
  onComplete,
  isCompleted = false,
}) => {
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const questions = content?.questions || [];
  const rivalIntervalMs = Math.max(
    3000,
    (content?.rivalIntervalSeconds ?? 8) * 1000
  );
  const steps = questions.length;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isRoundSubmitted, setIsRoundSubmitted] = useState<boolean>(false);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [rivalPos, setRivalPos] = useState<number>(0);
  const [rivalTimerMs, setRivalTimerMs] = useState<number>(rivalIntervalMs);

  const scoreRef = useRef<number>(0);
  const rivalPosRef = useRef<number>(0);
  const rivalTimerRef = useRef<number>(rivalIntervalMs);
  const finishedRef = useRef<boolean>(false);

  const currentItem = questions[currentIndex];
  const raceOver = steps > 0 && rivalPos >= steps;

  const finishRace = (score: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onComplete(score, steps);
  };

  // Rival engine: while a question is on screen (paused during feedback),
  // the rival advances one step every rivalIntervalMs. Crossing the finish
  // line ends the race immediately.
  useEffect(() => {
    if (isRoundSubmitted || raceOver || finishedRef.current) return;

    const id = setInterval(() => {
      rivalTimerRef.current -= TICK_MS;
      if (rivalTimerRef.current <= 0) {
        rivalTimerRef.current = rivalIntervalMs;
        rivalPosRef.current = Math.min(rivalPosRef.current + 1, steps);
        setRivalPos(rivalPosRef.current);
        if (rivalPosRef.current >= steps) {
          finishRace(scoreRef.current);
        }
      }
      setRivalTimerMs(rivalTimerRef.current);
    }, TICK_MS);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRoundSubmitted, raceOver, rivalIntervalMs, steps]);

  if (!currentItem) {
    return (
      <div className="p-6 text-center font-sans text-xs text-[#c4956a]">
        Data soal Kuis Balapan tidak ditemukan.
      </div>
    );
  }

  const handleSelectOption = (idx: number) => {
    if (isRoundSubmitted) return;
    if (soundEnabled) soundEngine.playSelect();
    setSelectedOptionIndex(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOptionIndex === null || isRoundSubmitted) return;

    const isCorrect = selectedOptionIndex === currentItem.correctAnswerIndex;
    setIsRoundSubmitted(true);

    if (isCorrect) {
      if (soundEnabled) soundEngine.playCorrect();
      const next = totalScore + 1;
      setTotalScore(next);
      scoreRef.current = next;
    } else {
      if (soundEnabled) soundEngine.playWrong();
    }
  };

  const handleNextRound = () => {
    if (soundEnabled) soundEngine.playClick();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsRoundSubmitted(false);
      // Fair start: each question gets a full rival thinking window.
      rivalTimerRef.current = rivalIntervalMs;
      setRivalTimerMs(rivalIntervalMs);
    } else {
      finishRace(totalScore);
    }
  };

  const isSelectedCorrect =
    selectedOptionIndex === currentItem.correctAnswerIndex;

  const playerPct = steps > 0 ? Math.min(100, (totalScore / steps) * 100) : 0;
  const rivalPct = steps > 0 ? Math.min(100, (rivalPos / steps) * 100) : 0;
  const rivalTimerPct = Math.max(0, Math.min(100, (rivalTimerMs / rivalIntervalMs) * 100));
  const rivalSecondsLeft = Math.ceil(rivalTimerMs / 1000);

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden gap-1.5 sm:gap-2 select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#5a3a18] pb-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-[#170f07] border border-[#f0d060] rounded text-[#f0d060]">
            <FlagCheckered size={14} weight="fill" />
          </div>
          <div>
            <h3 className="font-pixel text-[10px] sm:text-xs font-bold text-[#f0d060]">
              KUIS BALAPAN
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <PixelBadge variant="cyan" size="sm">
            Soal {currentIndex + 1}/{questions.length}
          </PixelBadge>
        </div>
      </div>

      {/* Race Track */}
      <div className="sdv-card-elevated p-2 sm:p-2.5 space-y-1.5 shrink-0">
        <div className="relative w-full h-16 sm:h-20 rounded-lg overflow-hidden border border-[#8b6f4e] bg-[#170f07] shadow-inner">
          {/* Track texture: dashes */}
          <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(90deg,transparent_0px,transparent_22px,#5a3a18_22px,#5a3a18_34px)]" />
          {/* Lane divider */}
          <div className="absolute inset-x-0 top-1/2 h-[2px] bg-[#5a3a18]" />
          {/* Finish line */}
          <div className="absolute right-0 top-0 bottom-0 w-3 bg-[repeating-linear-gradient(45deg,#f0d060_0px,#f0d060_3px,#1b120a_3px,#1b120a_6px)] opacity-80" />
          <FlagCheckered
            size={14}
            weight="fill"
            className="absolute right-4 top-0.5 text-[#f0d060]"
          />

          {/* Player lane (top) */}
          <div
            className="absolute top-1 -translate-x-1/2 text-lg sm:text-xl transition-all duration-500 ease-out drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            style={{ left: `${playerPct}%` }}
            aria-label="Balanapanmu"
          >
            🚗
          </div>
          {/* Rival lane (bottom) */}
          <div
            className="absolute bottom-1 -translate-x-1/2 text-lg sm:text-xl transition-all duration-500 ease-out drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            style={{ left: `${rivalPct}%` }}
            aria-label="Rival"
          >
            🏎️
          </div>
        </div>

        {/* Rival timer bar */}
        <div className="flex items-center gap-1.5">
          <Timer size={12} weight="bold" className="text-[#f0d060] shrink-0" />
          <div className="flex-1 h-2 bg-[#170f07] border border-[#5a3a18] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-100 ease-linear ${
                rivalTimerPct > 40
                  ? 'bg-[#7ec850]'
                  : rivalTimerPct > 15
                    ? 'bg-[#f0d060]'
                    : 'bg-[#d44040]'
              }`}
              style={{ width: `${rivalTimerPct}%` }}
            />
          </div>
          <span className="font-pixel text-[8px] text-[#c4956a] shrink-0 w-12 text-right">
            {rivalSecondsLeft} dtk
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="sdv-card-elevated p-2 sm:p-2.5 shrink-0">
        <h4 className="font-sans text-[11px] sm:text-xs font-bold text-white leading-relaxed text-justify break-words">
          {currentItem.text}
        </h4>
      </div>

      {/* Multiple Choice Options (2x2 grid) */}
      <div className="grid grid-cols-2 gap-1.5 flex-1 overflow-y-auto py-0.5">
        {currentItem.options.map((option, optIdx) => {
          const isSelected = selectedOptionIndex === optIdx;
          let optionClass =
            'bg-[#170f07] border-[#5a3a18] text-[#f0e0c0] hover:border-[#8b6f4e]';

          if (isRoundSubmitted) {
            if (optIdx === currentItem.correctAnswerIndex) {
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
                optIdx === currentItem.correctAnswerIndex && (
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
                <span className="text-[#7ec850]">Benar! Mobilmu melaju!</span>
              </>
            ) : (
              <>
                <XCircle size={14} weight="fill" className="text-[#ff8080]" />
                <span className="text-[#ff8080]">Salah! Mobilmu tak melaju</span>
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
          {isRoundSubmitted
            ? `${totalScore}/${questions.length} benar`
            : selectedOptionIndex !== null
              ? '1 jawaban dipilih'
              : `Rival melaju dalam ${rivalSecondsLeft} dtk`}
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
