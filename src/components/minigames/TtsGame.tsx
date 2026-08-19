'use client';

import React, { useState, useEffect } from 'react';
import { Check, ArrowCounterClockwise, Info, Sparkle, Lightbulb } from '@phosphor-icons/react';
import { TtsContent } from '@/types/game';
import { soundEngine } from '@/lib/sound';
import { useGameStore } from '@/store/useGameStore';
import { PixelBadge } from '../ui/PixelBadge';

interface TtsGameProps {
  content?: TtsContent;
  onComplete: (score: number, totalQuestions: number) => void;
  isCompleted?: boolean;
}

export const TtsGame: React.FC<TtsGameProps> = ({
  content,
  onComplete,
  isCompleted = false,
}) => {
  const soundEnabled = useGameStore((state) => state.soundEnabled);

  const clues = content?.clues || [];
  const rows = content?.gridRows || 6;
  const cols = content?.gridCols || 8;

  // Selected active clue
  const [activeClueId, setActiveClueId] = useState<string>(clues[0]?.id || '');
  // User grid state: { "row-col": "LETTER" }
  const [gridAnswers, setGridAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(isCompleted);
  const [correctClueIds, setCorrectClueIds] = useState<string[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Active clue
  const activeClue = clues.find((c) => c.id === activeClueId) || clues[0];

  // Initialize cells that belong to clues
  const validCellsMap: Record<string, { clueNumber?: number; clueIds: string[] }> = {};
  clues.forEach((clue) => {
    const len = clue.answer.length;
    for (let i = 0; i < len; i++) {
      const r = clue.direction === 'across' ? clue.row : clue.row + i;
      const c = clue.direction === 'across' ? clue.col + i : clue.col;
      const key = `${r}-${c}`;
      if (!validCellsMap[key]) {
        validCellsMap[key] = { clueIds: [] };
      }
      if (i === 0 && !validCellsMap[key].clueNumber) {
        validCellsMap[key].clueNumber = clue.number;
      }
      validCellsMap[key].clueIds.push(clue.id);
    }
  });

  const handleCellChange = (r: number, c: number, value: string) => {
    if (isSubmitted) return;
    const char = value.slice(-1).toUpperCase();
    if (char && !/^[A-Z]$/.test(char)) return;

    if (soundEnabled && char) soundEngine.playClick();

    const key = `${r}-${c}`;
    setGridAnswers((prev) => ({
      ...prev,
      [key]: char,
    }));
  };

  const checkSolution = () => {
    let correctCount = 0;
    const newCorrectClueIds: string[] = [];

    clues.forEach((clue) => {
      let isClueCorrect = true;
      const len = clue.answer.length;
      for (let i = 0; i < len; i++) {
        const r = clue.direction === 'across' ? clue.row : clue.row + i;
        const c = clue.direction === 'across' ? clue.col + i : clue.col;
        const key = `${r}-${c}`;
        const inputChar = gridAnswers[key] || '';
        if (inputChar.toUpperCase() !== clue.answer[i].toUpperCase()) {
          isClueCorrect = false;
          break;
        }
      }

      if (isClueCorrect) {
        correctCount += 1;
        newCorrectClueIds.push(clue.id);
      }
    });

    setCorrectClueIds(newCorrectClueIds);
    setIsSubmitted(true);

    if (correctCount === clues.length) {
      if (soundEnabled) soundEngine.playCorrect();
      onComplete(correctCount, clues.length);
    } else {
      if (soundEnabled) soundEngine.playWrong();
    }
  };

  const handleReset = () => {
    setGridAnswers({});
    setIsSubmitted(false);
    setCorrectClueIds([]);
    if (soundEnabled) soundEngine.playClick();
  };

  const handleFillSampleHint = () => {
    if (!activeClue) return;
    // Reveal 1st letter of active clue
    const key = `${activeClue.row}-${activeClue.col}`;
    setGridAnswers((prev) => ({
      ...prev,
      [key]: activeClue.answer[0],
    }));
    setShowHint(true);
    if (soundEnabled) soundEngine.playSelect();
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden gap-1.5 sm:gap-2 select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#5a3a18] pb-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-[#170f07] border border-[#f0d060] rounded text-[#f0d060]">
            <Sparkle size={14} weight="fill" />
          </div>
          <div>
            <h3 className="font-pixel text-[10px] sm:text-xs font-bold text-[#f0d060]">
              TEKA-TEKI SILANG
            </h3>
          </div>
        </div>

        <PixelBadge variant="emerald" size="sm">
          {clues.length} Kata Kunci
        </PixelBadge>
      </div>

      {/* Main Interactive Grid */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden py-0.5">
        <div className="bg-[#170f07] p-1.5 sm:p-2.5 border border-[#5a3a18] rounded-xl shadow-inner inline-block overflow-x-auto max-w-full">
          <div
            className="grid gap-1 select-none"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: rows }).map((_, r) =>
              Array.from({ length: cols }).map((_, c) => {
                const key = `${r}-${c}`;
                const cellInfo = validCellsMap[key];
                const isValid = Boolean(cellInfo);
                const isCurrentActiveClueCell =
                  isValid && activeClueId && cellInfo.clueIds.includes(activeClueId);
                const val = gridAnswers[key] || '';

                if (!isValid) {
                  return (
                    <div
                      key={key}
                      className="w-7 h-7 sm:w-8 sm:h-8 bg-[#120b06] border border-[#2d1b0e]/60 rounded opacity-30"
                    />
                  );
                }

                return (
                  <div
                    key={key}
                    onClick={() => {
                      if (cellInfo.clueIds.length > 0) {
                        setActiveClueId(cellInfo.clueIds[0]);
                        if (soundEnabled) soundEngine.playSelect();
                      }
                    }}
                    className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded border transition-all flex items-center justify-center cursor-pointer ${
                      isCurrentActiveClueCell
                        ? 'bg-[#3d2b1e] border-[#f0d060] shadow-[0_0_6px_rgba(240,208,96,0.5)]'
                        : 'bg-[#281c12] border-[#5a3a18] hover:border-[#8b6f4e]'
                    }`}
                  >
                    {cellInfo.clueNumber && (
                      <span className="absolute top-0.5 left-0.5 text-[7px] font-pixel text-[#f0d060] leading-none pointer-events-none">
                        {cellInfo.clueNumber}
                      </span>
                    )}

                    <input
                      type="text"
                      maxLength={1}
                      value={val}
                      disabled={isSubmitted}
                      onChange={(e) => handleCellChange(r, c, e.target.value)}
                      onFocus={() => {
                        if (cellInfo.clueIds.length > 0) {
                          setActiveClueId(cellInfo.clueIds[0]);
                        }
                      }}
                      className="w-full h-full text-center bg-transparent font-pixel text-xs sm:text-sm font-bold text-white uppercase outline-none"
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Active Clue Focus & Clue Navigation */}
      <div className="space-y-1 shrink-0">
        {activeClue && (
          <div className="sdv-card-elevated p-2 border border-[#f0d060] space-y-0.5">
            <div className="flex items-center justify-between text-[8px] font-pixel">
              <span className="text-[#7ec850] uppercase">
                #{activeClue.number} ({activeClue.direction === 'across' ? 'Mendatar →' : 'Menurun ↓'})
              </span>
              <span className="text-[#f0d060]">
                {activeClue.answer.length} Huruf
              </span>
            </div>
            <p className="font-sans text-[11px] sm:text-xs text-white font-medium leading-relaxed text-justify break-words">
              {activeClue.clue}
            </p>
          </div>
        )}

        {/* Clue Quick Switches */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {clues.map((clue) => {
            const isActive = clue.id === activeClueId;
            const isCorrect = isSubmitted && correctClueIds.includes(clue.id);

            return (
              <button
                key={clue.id}
                type="button"
                onClick={() => {
                  setActiveClueId(clue.id);
                  if (soundEnabled) soundEngine.playSelect();
                }}
                className={`py-0.5 px-2 rounded font-pixel text-[8px] border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 shrink-0 ${
                  isActive
                    ? 'bg-[#f0d060] text-[#1c120a] border-[#f0d060] font-bold'
                    : 'bg-[#170f07] text-[#c4956a] border-[#5a3a18]'
                }`}
              >
                <span>{clue.number} {clue.direction === 'across' ? '→' : '↓'}</span>
                {isCorrect && <Check size={10} weight="bold" className="text-[#7ec850]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-[#5a3a18] pt-1.5 flex items-center justify-between gap-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleFillSampleHint}
            disabled={isSubmitted}
            className="py-1 px-2 text-[9px] font-pixel text-[#f0d060] bg-[#2d1b0e] border border-[#8b6f4e] rounded transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <Lightbulb size={12} weight="bold" />
            <span>Bantuan</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="py-1 px-2 text-[9px] font-pixel text-[#c4956a] bg-[#170f07] border border-[#5a3a18] rounded transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ArrowCounterClockwise size={12} weight="bold" />
            <span>Reset</span>
          </button>
        </div>

        <button
          type="button"
          onClick={checkSolution}
          className="rpg-btn-primary py-1.5 px-3 text-[10px] sm:text-xs font-pixel font-bold flex items-center justify-center gap-1.5"
        >
          <Check size={14} weight="bold" />
          <span>PERIKSA TTS</span>
        </button>
      </div>
    </div>
  );
};
