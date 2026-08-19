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
    <div className="space-y-6">
      {/* Header & Instructions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#5a3a18] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#170f07] border border-[#f0d060] rounded text-[#f0d060]">
            <Sparkle size={18} weight="fill" />
          </div>
          <div>
            <h3 className="font-pixel text-xs sm:text-sm font-bold text-[#f0d060]">
              MINI-GAME: TEKA-TEKI SILANG (TTS)
            </h3>
            <p className="font-sans text-xs text-[#c4956a]">
              Pilih pertanyaan clue, lalu isi kotak huruf yang sesuai.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PixelBadge variant="emerald" size="sm">
            {clues.length} Kata Kunci
          </PixelBadge>
        </div>
      </div>

      {/* Main Gameplay Layout: Grid + Clues */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: TTS Interactive Grid (Mobile responsive) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="bg-[#170f07] p-3 sm:p-4 border-2 border-[#5a3a18] rounded-xl shadow-inner inline-block overflow-x-auto max-w-full">
            <div
              className="grid gap-1 sm:gap-1.5 select-none"
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
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-[#120b06] border border-[#2d1b0e]/60 rounded-md opacity-40"
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
                      className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-md border-2 transition-all flex items-center justify-center cursor-pointer ${
                        isCurrentActiveClueCell
                          ? 'bg-[#3d2b1e] border-[#f0d060] shadow-[0_0_8px_rgba(240,208,96,0.5)]'
                          : 'bg-[#281c12] border-[#5a3a18] hover:border-[#8b6f4e]'
                      }`}
                    >
                      {/* Clue Number Top-Left Badge */}
                      {cellInfo.clueNumber && (
                        <span className="absolute top-0.5 left-1 text-[8px] font-pixel text-[#f0d060] leading-none pointer-events-none">
                          {cellInfo.clueNumber}
                        </span>
                      )}

                      {/* Letter Input */}
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

          <div className="mt-3 flex items-center gap-3 text-xs text-[#a08060] font-sans">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-[#3d2b1e] border border-[#f0d060] rounded inline-block" />
              Kotak Aktif
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-[#281c12] border border-[#5a3a18] rounded inline-block" />
              Kotak Isian
            </span>
          </div>
        </div>

        {/* Right: Clue List & Active Clue Card */}
        <div className="lg:col-span-5 space-y-4 w-full">
          {/* Active Clue Focus Card */}
          {activeClue && (
            <div className="sdv-card-elevated p-4 border-2 border-[#f0d060] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[9px] text-[#7ec850] uppercase">
                  SOAL AKTIF: #{activeClue.number} ({activeClue.direction === 'across' ? 'Mendatar' : 'Menurun'})
                </span>
                <span className="font-pixel text-[9px] text-[#f0d060]">
                  {activeClue.answer.length} Huruf
                </span>
              </div>
              <p className="font-sans text-xs sm:text-sm text-white font-medium leading-relaxed">
                {activeClue.clue}
              </p>
            </div>
          )}

          {/* Clues Accordion List */}
          <div className="space-y-2">
            <h4 className="font-pixel text-[10px] text-[#c4956a] uppercase px-1">
              Daftar Petunjuk:
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
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
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all cursor-pointer flex items-start gap-2.5 ${
                      isActive
                        ? 'bg-[#2a1c0d] border-[#f0d060] text-white shadow-md'
                        : 'bg-[#170f07] border-[#5a3a18] text-[#d0c0a0] hover:border-[#8b6f4e]'
                    }`}
                  >
                    <span className="font-pixel text-[10px] bg-[#2d1b0e] text-[#f0d060] px-2 py-0.5 rounded border border-[#5a3a18] shrink-0 font-bold">
                      {clue.number} {clue.direction === 'across' ? '→' : '↓'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-xs line-clamp-2 leading-relaxed">
                        {clue.clue}
                      </p>
                      <span className="font-mono text-[10px] text-[#7ec850] mt-0.5 block">
                        ({clue.answer.length} Huruf)
                      </span>
                    </div>
                    {isCorrect && (
                      <Check size={16} weight="bold" className="text-[#7ec850] shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Helper Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleFillSampleHint}
              disabled={isSubmitted}
              className="flex-1 py-2 px-3 text-[11px] font-pixel text-[#f0d060] bg-[#2d1b0e] hover:bg-[#3d2b1e] border border-[#8b6f4e] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Lightbulb size={14} weight="bold" />
              <span>Buka 1 Huruf</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="py-2 px-3 text-[11px] font-pixel text-[#c4956a] bg-[#170f07] hover:bg-[#281c12] border border-[#5a3a18] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowCounterClockwise size={14} weight="bold" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Submit Button & Feedback */}
      <div className="border-t border-[#5a3a18] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          {isSubmitted && (
            <div className="flex items-center gap-2">
              <PixelBadge
                variant={correctClueIds.length === clues.length ? 'emerald' : 'red'}
                size="md"
              >
                {correctClueIds.length === clues.length
                  ? `SEMUA ${clues.length} KATA BENAR!`
                  : `${correctClueIds.length}/${clues.length} Kata Benar • Coba Lengkapi Lagi`}
              </PixelBadge>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={checkSolution}
          className="w-full sm:w-auto rpg-btn-primary py-3 px-8 text-xs font-pixel font-bold flex items-center justify-center gap-2"
        >
          <Check size={16} weight="bold" />
          <span>PERIKSA JAWABAN TTS</span>
        </button>
      </div>
    </div>
  );
};
