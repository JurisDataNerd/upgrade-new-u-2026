'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  CheckCircle,
  CaretRight,
  ArrowRight,
  Play,
  GameController,
} from '@phosphor-icons/react';
import { FLOORS_DATA, BOOTHS_DATA } from '@/data/mockData';
import { useGameStore } from '@/store/useGameStore';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { StampIcon } from '@/components/ui/StampIcon';
import { soundEngine } from '@/lib/sound';
import { Booth } from '@/types/game';

export const BuildingMap: React.FC = () => {
  const participant = useGameStore((state) => state.participant);
  const getFloorStatus = useGameStore((state) => state.getFloorStatus);
  const getCompletedFloorsCount = useGameStore((state) => state.getCompletedFloorsCount);
  const soundEnabled = useGameStore((state) => state.soundEnabled);

  const [selectedFloorNumber, setSelectedFloorNumber] = useState<number>(1);

  const completedFloors = getCompletedFloorsCount();
  const selectedFloor = FLOORS_DATA.find((f) => f.number === selectedFloorNumber) || FLOORS_DATA[0];
  const selectedBoothA = BOOTHS_DATA[selectedFloor.boothIds[0]];
  const selectedBoothB = BOOTHS_DATA[selectedFloor.boothIds[1]];

  const handleSelectFloor = (floorNum: number) => {
    setSelectedFloorNumber(floorNum);
    if (soundEnabled) soundEngine.playSelect();
  };

  const getGameTypeLabel = (type: string) => {
    switch (type) {
      case 'tts':
        return 'TTS';
      case 'tebak_kata':
        return 'Tebak Kata';
      case 'tebak_posisi':
        return 'Tebak Posisi';
      case 'tebak_gambar':
        return 'Tebak Gambar';
      case 'memory_match':
        return 'Memory Match';
      case 'kuis_cepat':
        return 'Kuis Cepat';
      case 'benar_salah':
        return 'Benar / Salah';
      default:
        return 'Mini-Game';
    }
  };

  return (
    <div className="w-full h-full max-w-5xl mx-auto px-2.5 sm:px-6 py-2 sm:py-4 flex flex-col justify-between overflow-hidden gap-2">
      {/* Top Status Bar (Compact) */}
      <div className="bg-[#1f140a] border-2 border-[#5a3a18] rounded-xl p-2 sm:p-3 flex items-center justify-between gap-2 shadow-md shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#2d1b0e] border border-[#8b6f4e] rounded-lg flex items-center justify-center text-[#f0d060] shrink-0">
            <GameController size={18} weight="bold" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-pixel text-[11px] sm:text-xs font-bold text-white leading-tight">
              PETA 9 LANTAI KAMPUS
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-sans text-[#c4956a] flex-wrap">
              <span>{completedFloors}/9 Tuntas</span>
              <span>•</span>
              <span className="text-[#7ec850]">{participant.completedBooths.length}/18 Stempel</span>
              <span>•</span>
              <span className="text-[#f0d060]">{participant.totalXp} XP</span>
            </div>
          </div>
        </div>

        <Link href="/play" className="shrink-0">
          <button
            onClick={() => soundEnabled && soundEngine.playClick()}
            className="rpg-btn-primary py-1.5 sm:py-2 px-3 text-[10px] sm:text-xs font-pixel font-bold flex items-center gap-1.5"
          >
            <Play size={12} weight="fill" />
            <span>Mulai</span>
          </button>
        </Link>
      </div>

      {/* 9 Floors Horizontal Selector for Mobile / Grid on Tablet+ */}
      <div className="bg-[#170f07] p-1.5 sm:p-2 border-2 border-[#5a3a18] rounded-xl shrink-0">
        <div className="flex items-center justify-between px-1 pb-1">
          <span className="text-[9px] font-pixel text-[#a08060] uppercase">
            PILIH LANTAI:
          </span>
          <span className="text-[9px] font-pixel text-[#f0d060]">
            Lantai Aktif: L{selectedFloorNumber}
          </span>
        </div>

        {/* 9 Buttons Grid (Fits 1 row of 9 on mobile without scroll!) */}
        <div className="grid grid-cols-9 gap-1 sm:gap-2">
          {FLOORS_DATA.map((floor) => {
            const status = getFloorStatus(floor.number);
            const isSelected = selectedFloorNumber === floor.number;

            return (
              <button
                key={floor.number}
                onClick={() => handleSelectFloor(floor.number)}
                className={`py-1.5 sm:py-2 px-0.5 rounded-lg text-center border font-pixel text-[9px] sm:text-xs transition-all cursor-pointer flex flex-col items-center justify-center relative ${
                  isSelected
                    ? 'bg-[#3d7828] border-[#f0d060] text-white font-bold shadow-[0_0_8px_rgba(240,208,96,0.4)] scale-[1.02]'
                    : status === 'completed'
                    ? 'bg-[#1f3a2b] border-[#4a8030] text-[#7ec850] hover:bg-[#284a37]'
                    : 'bg-[#23160c] border-[#3d2b1e] text-[#c4956a] hover:bg-[#2d1b0e]'
                }`}
              >
                <span>L{floor.number}</span>
                {status === 'completed' && (
                  <span className="w-1.5 h-1.5 bg-[#7ec850] rounded-full mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Floor Details Card */}
      <div className="flex-1 sdv-card p-3 sm:p-4 flex flex-col justify-between overflow-hidden shadow-lg">
        {/* Floor Header */}
        <div className="flex items-center justify-between gap-2 border-b border-[#5a3a18] pb-2 shrink-0">
          <div className="min-w-0 flex-1">
            <span className="font-pixel text-[8px] sm:text-[9px] text-[#7ec850] uppercase tracking-wider block">
              ZONA LANTAI {selectedFloor.number}
            </span>
            <h2 className="font-pixel text-xs sm:text-sm font-bold text-white mt-0.5 leading-snug break-words">
              {selectedFloor.name}
            </h2>
          </div>

          <Link href={`/play/floor/${selectedFloor.number}/intro`} className="shrink-0">
            <button
              onClick={() => soundEnabled && soundEngine.playClick()}
              className="rpg-btn-primary py-1.5 px-3 text-[10px] sm:text-xs font-pixel font-bold flex items-center gap-1.5 shadow"
            >
              <span>Mulai Lantai</span>
              <ArrowRight size={12} weight="bold" />
            </button>
          </Link>
        </div>

        {/* 2 Spots Grid */}
        <div className="space-y-2 py-2 flex-1 flex flex-col justify-center">
          <div className="text-[9px] font-pixel text-[#a08060] uppercase px-0.5">
            2 Spot Tantangan:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <SpotMiniCard
              booth={selectedBoothA}
              isCompleted={participant.completedBooths.includes(selectedBoothA.id)}
              gameTypeLabel={getGameTypeLabel(selectedBoothA.tipe_game)}
            />

            <SpotMiniCard
              booth={selectedBoothB}
              isCompleted={participant.completedBooths.includes(selectedBoothB.id)}
              gameTypeLabel={getGameTypeLabel(selectedBoothB.tipe_game)}
            />
          </div>
        </div>

        {/* Footer Note */}
        <div className="border-t border-[#3d2b1e] pt-1.5 text-center text-[9px] font-sans text-[#a08060] shrink-0">
          Setiap lantai memiliki 2 spot mini-game. Selesaikan keduanya untuk membuka stempel!
        </div>
      </div>
    </div>
  );
};

interface SpotMiniCardProps {
  booth: Booth;
  isCompleted: boolean;
  gameTypeLabel: string;
}

const SpotMiniCard: React.FC<SpotMiniCardProps> = ({
  booth,
  isCompleted,
  gameTypeLabel,
}) => {
  const soundEnabled = useGameStore((state) => state.soundEnabled);

  return (
    <div
      className={`p-2 sm:p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
        isCompleted
          ? 'bg-[#1a2e1a] border-[#4a8030]'
          : 'bg-[#170f07] border-[#3d2b1e] hover:border-[#5a3a18]'
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#23160c] border border-[#5a3a18] flex items-center justify-center shrink-0">
          <StampIcon name={booth.stampIcon} size={16} className="text-[#f0d060]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-pixel text-[8px] text-[#f0d060]">
              {booth.code}
            </span>
            <PixelBadge variant="gold" size="sm">
              {gameTypeLabel}
            </PixelBadge>
          </div>
          <h4 className="font-pixel text-[9px] sm:text-[10px] font-bold text-white leading-normal break-words mt-0.5">
            {booth.name}
          </h4>
        </div>
      </div>

      <div className="shrink-0">
        <Link href={`/play/floor/${booth.floorNumber}/spot/${booth.id}`}>
          <button
            onClick={() => soundEnabled && soundEngine.playClick()}
            className={`py-1 px-2.5 rounded text-[10px] sm:text-[11px] font-pixel font-bold cursor-pointer transition-all ${
              isCompleted
                ? 'bg-[#2d1b0e] text-[#a08060] border border-[#5a3a18] hover:text-white'
                : 'rpg-btn-primary'
            }`}
          >
            {isCompleted ? 'Ulang' : 'Main'}
          </button>
        </Link>
      </div>
    </div>
  );
};
