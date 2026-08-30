'use client';

import React from 'react';
import { Booth } from '@/types/game';
import { TtsGame } from './TtsGame';
import { TebakKataGame } from './TebakKataGame';
import { TebakPosisiGame } from './TebakPosisiGame';
import { TebakGambarGame } from './TebakGambarGame';
import { KuisBalapanGame } from './KuisBalapanGame';
import { MemoryMatchGame } from './MemoryMatchGame';
import { KuisCepatGame } from './KuisCepatGame';
import { BenarSalahGame } from './BenarSalahGame';

interface MiniGameContainerProps {
  booth: Booth;
  onComplete: (score: number, totalQuestions: number) => void;
  isCompleted?: boolean;
}

export const MiniGameContainer: React.FC<MiniGameContainerProps> = ({
  booth,
  onComplete,
  isCompleted = false,
}) => {
  const gameType = booth.tipe_game || booth.type || 'kuis_cepat';

  switch (gameType) {
    case 'tts':
      return (
        <TtsGame
          content={booth.ttsContent}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />
      );

    case 'tebak_kata':
      return (
        <TebakKataGame
          content={booth.tebakKataContent}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />
      );

    case 'tebak_posisi':
      return (
        <TebakPosisiGame
          content={booth.tebakPosisiContent}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />
      );

    case 'tebak_gambar':
      return (
        <TebakGambarGame
          content={booth.tebakGambarContent}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />
      );

    case 'kuis_balapan':
      return (
        <KuisBalapanGame
          content={booth.kuisBalapanContent}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />
      );

    case 'memory_match':
      return (
        <MemoryMatchGame
          content={booth.memoryMatchContent}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />
      );

    case 'benar_salah':
      return (
        <BenarSalahGame
          content={booth.benarSalahContent}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />
      );

    case 'kuis_cepat':
    case 'kuis':
    default:
      return (
        <KuisCepatGame
          content={booth.kuisCepatContent}
          fallbackQuestions={booth.questions}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />
      );
  }
};
