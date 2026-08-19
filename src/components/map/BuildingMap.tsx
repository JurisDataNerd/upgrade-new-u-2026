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
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* Top Simple Status Bar */}
      <div className="bg-[#1f140a] border-2 border-[#5a3a18] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2d1b0e] border border-[#8b6f4e] rounded-lg flex items-center justify-center text-[#f0d060] shrink-0">
            <GameController size={22} weight="bold" />
          </div>
          <div>
            <div className="font-pixel text-xs font-bold text-white">
              PETA 9 LANTAI KAMPUS
            </div>
            <div className="flex items-center gap-2 text-xs font-sans text-[#c4956a] mt-0.5">
              <span>{completedFloors}/9 Lantai Tuntas</span>
              <span>•</span>
              <span className="text-[#7ec850]">{participant.completedBooths.length}/18 Stempel</span>
              <span>•</span>
              <span className="text-[#f0d060]">{participant.totalXp} XP</span>
            </div>
          </div>
        </div>

        <Link href="/play">
          <button
            onClick={() => soundEnabled && soundEngine.playClick()}
            className="w-full sm:w-auto rpg-btn-primary py-2.5 px-4 text-xs font-pixel font-bold flex items-center justify-center gap-2"
          >
            <Play size={14} weight="fill" />
            <span>Mulai Alur Cerita</span>
          </button>
        </Link>
      </div>

      {/* Main Exploration: 9-Story List + Selected Floor */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left: 9 Floors Clean List */}
        <div className="md:col-span-5 space-y-1.5 bg-[#170f07] p-2.5 border-2 border-[#5a3a18] rounded-xl">
          <div className="text-[10px] font-pixel text-[#a08060] px-2 py-1 uppercase tracking-wider">
            Pilih Lantai (1 - 9):
          </div>

          {[...FLOORS_DATA].reverse().map((floor) => {
            const status = getFloorStatus(floor.number);
            const isSelected = selectedFloorNumber === floor.number;

            return (
              <button
                key={floor.number}
                onClick={() => handleSelectFloor(floor.number)}
                className={`w-full text-left rounded-lg p-2.5 flex items-center justify-between gap-2 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#3d7828] border-[#f0d060] text-white font-bold shadow'
                    : status === 'completed'
                    ? 'bg-[#1f3a2b]/60 border-[#4a8030] text-[#d0e8c0] hover:bg-[#1f3a2b]'
                    : 'bg-[#23160c] border-[#3d2b1e] text-[#c4956a] hover:bg-[#2d1b0e]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center font-pixel text-[10px] shrink-0 ${
                      isSelected
                        ? 'bg-[#f0d060] text-[#1b120a]'
                        : status === 'completed'
                        ? 'bg-[#235736] text-[#7ec850]'
                        : 'bg-[#170f07] text-[#a08060]'
                    }`}
                  >
                    L{floor.number}
                  </span>
                  <span className="font-pixel text-xs truncate">
                    Lantai {floor.number}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {status === 'completed' ? (
                    <PixelBadge variant="emerald" size="sm">
                      <CheckCircle size={10} weight="bold" /> Tuntas
                    </PixelBadge>
                  ) : status === 'partial' ? (
                    <PixelBadge variant="gold" size="sm">
                      1/2
                    </PixelBadge>
                  ) : null}
                  <CaretRight
                    size={14}
                    weight="bold"
                    className={isSelected ? 'text-[#f0d060]' : 'text-[#5a3a18]'}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Floor Details & 2 Spots */}
        <div className="md:col-span-7 space-y-3">
          <div className="sdv-card p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-[#5a3a18] pb-3">
              <div>
                <span className="font-pixel text-[9px] text-[#7ec850] uppercase tracking-wider">
                  LANTAI {selectedFloor.number}
                </span>
                <h2 className="font-pixel text-sm sm:text-base font-bold text-white mt-0.5">
                  {selectedFloor.name}
                </h2>
              </div>

              <Link href={`/play/floor/${selectedFloor.number}/intro`}>
                <button
                  onClick={() => soundEnabled && soundEngine.playClick()}
                  className="rpg-btn-primary py-2 px-3 text-xs font-pixel font-bold flex items-center gap-1.5"
                >
                  <span>Mulai Misi</span>
                  <ArrowRight size={14} weight="bold" />
                </button>
              </Link>
            </div>

            {/* 2 Spots Mini-Cards */}
            <div className="space-y-2.5 pt-1">
              <div className="text-[10px] font-pixel text-[#a08060] uppercase">
                2 Spot di Lantai Ini:
              </div>

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
      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
        isCompleted
          ? 'bg-[#1a2e1a] border-[#4a8030]'
          : 'bg-[#170f07] border-[#3d2b1e] hover:border-[#5a3a18]'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-[#23160c] border border-[#5a3a18] flex items-center justify-center shrink-0">
          <StampIcon name={booth.stampIcon} size={20} className="text-[#f0d060]" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[9px] text-[#f0d060]">
              {booth.code}
            </span>
            <PixelBadge variant="gold" size="sm">
              {gameTypeLabel}
            </PixelBadge>
          </div>
          <h4 className="font-pixel text-xs text-white truncate mt-0.5">
            {booth.name}
          </h4>
        </div>
      </div>

      <div className="shrink-0">
        <Link href={`/play/floor/${booth.floorNumber}/spot/${booth.id}`}>
          <button
            onClick={() => soundEnabled && soundEngine.playClick()}
            className={`py-1.5 px-3 rounded text-[11px] font-pixel font-bold cursor-pointer transition-all ${
              isCompleted
                ? 'bg-[#2d1b0e] text-[#a08060] border border-[#5a3a18] hover:text-white'
                : 'rpg-btn-primary'
            }`}
          >
            {isCompleted ? 'Main Ulang' : 'Mainkan'}
          </button>
        </Link>
      </div>
    </div>
  );
};
