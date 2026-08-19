'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkle,
  Cards,
  CheckCircle,
  ArrowCounterClockwise,
  Check,
  Star,
} from '@phosphor-icons/react';
import { MemoryMatchContent } from '@/types/game';
import { soundEngine } from '@/lib/sound';
import { useGameStore } from '@/store/useGameStore';
import { PixelBadge } from '../ui/PixelBadge';

interface MemoryMatchGameProps {
  content?: MemoryMatchContent;
  onComplete: (score: number, totalQuestions: number) => void;
  isCompleted?: boolean;
}

interface CardItem {
  uid: string;
  pairId: string;
  type: 'A' | 'B';
  text: string;
  tag?: string;
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  content,
  onComplete,
  isCompleted = false,
}) => {
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const pairs = content?.pairs || [];

  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(isCompleted);

  // Initialize and shuffle cards
  useEffect(() => {
    if (pairs.length === 0) return;

    const deck: CardItem[] = [];
    pairs.forEach((pair) => {
      deck.push({
        uid: `${pair.id}-A`,
        pairId: pair.id,
        type: 'A',
        text: pair.labelA,
        tag: pair.tag,
      });
      deck.push({
        uid: `${pair.id}-B`,
        pairId: pair.id,
        type: 'B',
        text: pair.labelB,
        tag: pair.tag,
      });
    });

    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedIndices([]);
    setMatchedPairIds([]);
    setMovesCount(0);
    setIsProcessing(false);
    setIsFinished(false);
  }, [content]);

  const handleCardClick = (index: number) => {
    if (isProcessing || isFinished) return;
    if (flippedIndices.includes(index)) return;
    const clickedCard = cards[index];
    if (matchedPairIds.includes(clickedCard.pairId)) return;

    if (soundEnabled) soundEngine.playSelect();

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // If 2 cards flipped, check for match
    if (newFlipped.length === 2) {
      setMovesCount((prev) => prev + 1);
      setIsProcessing(true);

      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];

      if (firstCard.pairId === secondCard.pairId && firstCard.type !== secondCard.type) {
        // Matched!
        setTimeout(() => {
          if (soundEnabled) soundEngine.playCorrect();
          const newMatched = [...matchedPairIds, firstCard.pairId];
          setMatchedPairIds(newMatched);
          setFlippedIndices([]);
          setIsProcessing(false);

          // All pairs found!
          if (newMatched.length === pairs.length) {
            setIsFinished(true);
            onComplete(pairs.length, pairs.length);
          }
        }, 500);
      } else {
        // Not a match, flip back
        setTimeout(() => {
          if (soundEnabled) soundEngine.playWrong();
          setFlippedIndices([]);
          setIsProcessing(false);
        }, 900);
      }
    }
  };

  const handleResetGame = () => {
    if (pairs.length === 0) return;
    const deck: CardItem[] = [];
    pairs.forEach((pair) => {
      deck.push({
        uid: `${pair.id}-A`,
        pairId: pair.id,
        type: 'A',
        text: pair.labelA,
        tag: pair.tag,
      });
      deck.push({
        uid: `${pair.id}-B`,
        pairId: pair.id,
        type: 'B',
        text: pair.labelB,
        tag: pair.tag,
      });
    });

    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedIndices([]);
    setMatchedPairIds([]);
    setMovesCount(0);
    setIsProcessing(false);
    setIsFinished(false);
    if (soundEnabled) soundEngine.playClick();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#5a3a18] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#170f07] border border-[#f0d060] rounded text-[#f0d060]">
            <Cards size={18} weight="fill" />
          </div>
          <div>
            <h3 className="font-pixel text-xs sm:text-sm font-bold text-[#f0d060]">
              MINI-GAME: MEMORY MATCH KARTU
            </h3>
            <p className="font-sans text-xs text-[#c4956a]">
              Buka dan cocokkan pasangan istilah nilai dengan keterangannya!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PixelBadge variant="gold" size="sm">
            {matchedPairIds.length}/{pairs.length} Pasangan Cocok
          </PixelBadge>
          <PixelBadge variant="wood" size="sm">
            {movesCount} Percobaan
          </PixelBadge>
        </div>
      </div>

      {content?.themeDescription && (
        <div className="bg-[#170f07] p-3 rounded-lg border border-[#5a3a18] text-xs font-sans text-[#f0e0c0]">
          <strong>Misi:</strong> {content.themeDescription}
        </div>
      )}

      {/* 8 Cards Grid (2 rows x 4 cols on tablet/desktop, 4 rows x 2 cols on mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 select-none">
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx);
          const isMatched = matchedPairIds.includes(card.pairId);
          const isOpen = isFlipped || isMatched;

          return (
            <motion.button
              key={card.uid}
              type="button"
              onClick={() => handleCardClick(idx)}
              disabled={isOpen || isProcessing}
              whileTap={{ scale: 0.96 }}
              className={`h-32 sm:h-36 rounded-xl border-2 p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden ${
                isMatched
                  ? 'bg-gradient-to-b from-[#235736] to-[#14331e] border-[#7ec850] text-[#f0ffd0] shadow-[0_0_12px_rgba(126,200,80,0.4)]'
                  : isFlipped
                  ? 'bg-gradient-to-b from-[#4d3b2e] to-[#2d1b0e] border-[#f0d060] text-white shadow-lg'
                  : 'bg-gradient-to-b from-[#281c12] to-[#170f07] border-[#5a3a18] hover:border-[#8b6f4e] text-[#a08060]'
              }`}
            >
              {isOpen ? (
                <div className="flex flex-col items-center justify-between h-full w-full py-1">
                  {card.tag && (
                    <span className="font-pixel text-[8px] text-[#f0d060] bg-[#120b06]/80 px-2 py-0.5 rounded border border-[#5a3a18]">
                      {card.tag}
                    </span>
                  )}

                  <p className="font-sans text-xs sm:text-sm font-semibold leading-snug my-auto px-1">
                    {card.text}
                  </p>

                  {isMatched && (
                    <div className="flex items-center gap-1 text-[9px] font-pixel text-[#7ec850] mt-1">
                      <CheckCircle size={12} weight="fill" />
                      <span>COCOK</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#120b06] border border-[#8b6f4e] flex items-center justify-center text-[#f0d060] shadow-inner">
                    <Star size={20} weight="fill" className="opacity-80" />
                  </div>
                  <span className="font-pixel text-[9px] text-[#8b6f4e] uppercase">
                    KARTU #{idx + 1}
                  </span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Completion Banner */}
      {isFinished && (
        <div className="bg-[#14230f] border-2 border-[#7ec850] p-4 sm:p-5 rounded-xl text-center space-y-2 animate-in fade-in">
          <div className="flex items-center justify-center gap-2 font-pixel text-xs sm:text-sm text-[#7ec850] font-bold">
            <CheckCircle size={20} weight="fill" />
            <span>SEMUA {pairs.length} PASANGAN KARTU COCOK DITEMUKAN!</span>
          </div>
          <p className="font-sans text-xs text-[#e0f0d0]">
            Sempurna! Kamu berhasil menyelesaikan tantangan dalam {movesCount} langkah percobaan.
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div className="border-t border-[#5a3a18] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs font-sans text-[#a08060]">
          Cocokkan seluruh {pairs.length} pasang kartu untuk menyelesaikan mini-game.
        </div>

        <button
          type="button"
          onClick={handleResetGame}
          className="w-full sm:w-auto rpg-btn-wood py-3 px-6 text-xs font-pixel font-bold flex items-center justify-center gap-2"
        >
          <ArrowCounterClockwise size={16} weight="bold" />
          <span>Kocok Ulang Kartu</span>
        </button>
      </div>
    </div>
  );
};
