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
    <div className="h-full flex flex-col justify-between overflow-hidden gap-1.5 sm:gap-2 select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#5a3a18] pb-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-[#170f07] border border-[#f0d060] rounded text-[#f0d060]">
            <Cards size={14} weight="fill" />
          </div>
          <div>
            <h3 className="font-pixel text-[10px] sm:text-xs font-bold text-[#f0d060]">
              MEMORY MATCH
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <PixelBadge variant="gold" size="sm">
            {matchedPairIds.length}/{pairs.length} Cocok
          </PixelBadge>
          <PixelBadge variant="wood" size="sm">
            {movesCount} Coba
          </PixelBadge>
        </div>
      </div>

      {/* 8 Cards Grid (2 rows x 4 cols on all mobile screens!) */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 flex-1 items-center select-none py-1">
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
              whileTap={{ scale: 0.95 }}
              className={`h-20 sm:h-28 rounded-lg sm:rounded-xl border p-1.5 sm:p-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden ${
                isMatched
                  ? 'bg-gradient-to-b from-[#235736] to-[#14331e] border-[#7ec850] text-[#f0ffd0] shadow-[0_0_8px_rgba(126,200,80,0.3)]'
                  : isFlipped
                  ? 'bg-gradient-to-b from-[#4d3b2e] to-[#2d1b0e] border-[#f0d060] text-white shadow'
                  : 'bg-gradient-to-b from-[#281c12] to-[#170f07] border-[#5a3a18] hover:border-[#8b6f4e] text-[#a08060]'
              }`}
            >
              {isOpen ? (
                <div className="flex flex-col items-center justify-between h-full w-full py-0.5">
                  {card.tag && (
                    <span className="font-pixel text-[7px] text-[#f0d060] bg-[#120b06]/80 px-1 py-0.2 rounded border border-[#5a3a18] line-clamp-1">
                      {card.tag}
                    </span>
                  )}

                  <p className="font-sans text-[10px] sm:text-xs font-semibold leading-tight my-auto px-0.5 line-clamp-3">
                    {card.text}
                  </p>

                  {isMatched && (
                    <div className="flex items-center gap-0.5 text-[7px] font-pixel text-[#7ec850]">
                      <CheckCircle size={10} weight="fill" />
                      <span>COCOK</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#120b06] border border-[#8b6f4e] flex items-center justify-center text-[#f0d060] shadow-inner">
                    <Star size={14} weight="fill" className="opacity-80" />
                  </div>
                  <span className="font-pixel text-[7px] sm:text-[8px] text-[#8b6f4e]">
                    #{idx + 1}
                  </span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Completion Banner */}
      {isFinished && (
        <div className="bg-[#14230f] border border-[#7ec850] p-2 rounded-lg text-center space-y-0.5 animate-in fade-in shrink-0">
          <div className="flex items-center justify-center gap-1.5 font-pixel text-[10px] sm:text-xs text-[#7ec850] font-bold">
            <CheckCircle size={14} weight="fill" />
            <span>SEMUA KARTU COCOK DITEMUKAN!</span>
          </div>
          <p className="font-sans text-[10px] text-[#e0f0d0]">
            Tuntas dalam {movesCount} percobaan.
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div className="border-t border-[#5a3a18] pt-1.5 flex items-center justify-between gap-2 shrink-0">
        <div className="text-[10px] font-sans text-[#a08060] truncate">
          Cocokkan 4 pasang kartu istilah
        </div>

        <button
          type="button"
          onClick={handleResetGame}
          className="rpg-btn-wood py-1.5 px-3 text-[10px] sm:text-xs font-pixel font-bold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowCounterClockwise size={12} weight="bold" />
          <span>Kocok Ulang</span>
        </button>
      </div>
    </div>
  );
};
