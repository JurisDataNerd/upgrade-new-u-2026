'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  Sparkle,
  Play,
  CheckCircle,
  BookOpen,
  Buildings,
} from '@phosphor-icons/react';
import { FLOORS_DATA, BOOTHS_DATA, AVATAR_OPTIONS } from '@/data/mockData';
import { useGameStore } from '@/store/useGameStore';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { StampIcon } from '@/components/ui/StampIcon';
import { Navbar } from '@/components/layout/Navbar';
import { CrtScanlines } from '@/components/layout/CrtScanlines';
import { soundEngine } from '@/lib/sound';

export default function FloorIntroPage() {
  const params = useParams();
  const router = useRouter();
  const floorId = (params.floorId as string) || '1';
  const floorNumber = parseInt(floorId, 10) || 1;

  const floor = FLOORS_DATA.find((f) => f.number === floorNumber) || FLOORS_DATA[0];
  const boothA = BOOTHS_DATA[floor.boothIds[0]];
  const boothB = BOOTHS_DATA[floor.boothIds[1]];

  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const participant = useGameStore((state) => state.participant);
  const getFloorStatus = useGameStore((state) => state.getFloorStatus);

  const [isPortalPulsing, setIsPortalPulsing] = useState(false);
  const floorStatus = getFloorStatus(floor.number);

  const selectedAvatar =
    AVATAR_OPTIONS.find((a) => a.id === participant.avatar) || AVATAR_OPTIONS[0];

  const handleStartSpot1 = () => {
    if (soundEnabled) soundEngine.playClick();
    router.push(`/play/floor/${floor.number}/spot/${boothA.id}`);
  };

  const handlePortalTap = () => {
    if (soundEnabled) soundEngine.playSelect();
    setIsPortalPulsing(true);
    setTimeout(() => setIsPortalPulsing(false), 500);
  };

  const getGameTypeLabel = (type: string) => {
    switch (type) {
      case 'tts':
        return 'Teka-Teki Silang';
      case 'tebak_kata':
        return 'Tebak Kata';
      case 'tebak_posisi':
        return 'Tebak Lokasi';
      case 'memory_match':
        return 'Mencocokkan Kartu';
      case 'kuis_cepat':
        return 'Kuis Cepat';
      case 'benar_salah':
        return 'Benar / Salah';
      default:
        return 'Tantangan Mini-Game';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#2d1b0e] text-[#f0e0c0] w-full overflow-x-hidden">
      <CrtScanlines />
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 space-y-5">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/peta"
            onClick={() => soundEnabled && soundEngine.playClick()}
            className="inline-flex items-center gap-2 text-xs font-pixel text-[#c4956a] hover:text-[#f0d060] transition-colors"
          >
            <ArrowLeft size={16} weight="bold" />
            <span>Kembali</span>
          </Link>

          <div className="flex items-center gap-2">
            <PixelBadge variant="gold" size="sm">
              Lantai {floor.number} dari 9
            </PixelBadge>
            {floorStatus === 'completed' && (
              <PixelBadge variant="emerald" size="sm">
                Tuntas
              </PixelBadge>
            )}
          </div>
        </div>

        {/* Main Floor Banner Card */}
        <div className="sdv-card-gold p-5 sm:p-7 space-y-6 text-center">
          {/* Header Title */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 font-pixel text-[10px] text-[#7ec850] uppercase tracking-wider bg-[#170f07] px-3 py-1 rounded-full border border-[#5a3a18]">
              <Buildings size={14} weight="fill" className="text-[#f0d060]" />
              <span>ZONA EKSPLORASI KAMPUS</span>
            </div>
            <h1 className="font-pixel text-xl sm:text-2xl font-bold text-white tracking-wide mt-2">
              {floor.name}
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#f0d060] font-medium">
              {floor.theme}
            </p>
          </div>

          {/* Interactive Circular Building Portal */}
          <div className="flex justify-center my-2">
            <div className="relative">
              <button
                type="button"
                onClick={handlePortalTap}
                title="Klik portal gedung untuk efek suara"
                className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1.5 bg-gradient-to-b from-[#f0d060] to-[#5a3a18] shadow-[0_0_30px_rgba(240,208,96,0.35)] transition-transform cursor-pointer relative overflow-hidden ${
                  isPortalPulsing ? 'scale-105' : 'hover:scale-[1.03]'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden relative border-3 border-[#2d1b0e]">
                  <Image
                    src="/unu-hero.jpeg"
                    alt={`Gedung Lantai ${floor.number}`}
                    fill
                    priority
                    className="object-cover object-center filter brightness-[0.9]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1c120a]/80 via-transparent to-black/30" />

                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-3 text-center">
                    <span className="font-pixel text-[10px] sm:text-xs text-[#f0d060] font-black bg-[#170f07]/90 px-3 py-1 rounded-full border border-[#f0d060] shadow-md">
                      LANTAI {floor.number}
                    </span>
                  </div>
                </div>
              </button>

              {floorStatus === 'completed' && (
                <div className="absolute -top-2 -right-2 bg-[#7ec850] text-[#1b120a] p-1.5 rounded-full shadow-lg border-2 border-[#1c120a]">
                  <CheckCircle size={20} weight="fill" />
                </div>
              )}
            </div>
          </div>

          {/* Character Dialogue RPG Box */}
          <div className="bg-[#170f07] p-4 sm:p-5 border-2 border-[#5a3a18] rounded-xl text-left relative shadow-inner">
            <div className="flex items-start gap-3.5">
              <div className="w-13 h-13 rounded-xl overflow-hidden bg-[#281c12] border-2 border-[#f0d060] shrink-0 relative shadow">
                <Image
                  src={selectedAvatar.avatarImage}
                  alt={selectedAvatar.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-xs text-[#f0d060] font-bold">
                    {participant.name}
                  </span>
                  <PixelBadge variant="wood" size="sm">
                    Mahasiswa Baru
                  </PixelBadge>
                </div>
                <p className="font-sans text-xs sm:text-sm text-[#d0c0a0] leading-relaxed">
                  &ldquo;{floor.storyIntro?.narrative || floor.description}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* 2 Spots Grid Preview */}
          <div className="space-y-2.5 text-left">
            <div className="flex items-center justify-between px-1">
              <span className="font-pixel text-[10px] text-[#a08060] uppercase">
                Tantangan di Lantai Ini (2 Spot):
              </span>
              <span className="font-pixel text-[10px] text-[#7ec850]">
                Total: +500 XP & 2 Stempel
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Spot 1 */}
              <div
                className={`p-3.5 rounded-xl border-2 transition-all space-y-2 ${
                  participant.completedBooths.includes(boothA.id)
                    ? 'bg-[#1a2e1a] border-[#7ec850]'
                    : 'bg-[#170f07] border-[#5a3a18]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#281c12] border border-[#f0d060] flex items-center justify-center">
                      <StampIcon name={boothA.stampIcon} size={18} className="text-[#f0d060]" />
                    </div>
                    <div>
                      <span className="font-pixel text-[9px] text-[#7ec850] font-bold block">
                        SPOT 1 • {boothA.code}
                      </span>
                      <h4 className="font-pixel text-xs text-white truncate max-w-[170px]">
                        {boothA.name}
                      </h4>
                    </div>
                  </div>

                  {participant.completedBooths.includes(boothA.id) ? (
                    <CheckCircle size={20} weight="fill" className="text-[#7ec850] shrink-0" />
                  ) : (
                    <PixelBadge variant="gold" size="sm">
                      +250 XP
                    </PixelBadge>
                  )}
                </div>

                <div className="font-sans text-[11px] text-[#c4956a] border-t border-[#3d2b1e] pt-1.5 flex items-center justify-between">
                  <span>Mekanik: <strong>{getGameTypeLabel(boothA.tipe_game)}</strong></span>
                </div>
              </div>

              {/* Spot 2 */}
              <div
                className={`p-3.5 rounded-xl border-2 transition-all space-y-2 ${
                  participant.completedBooths.includes(boothB.id)
                    ? 'bg-[#1a2e1a] border-[#7ec850]'
                    : 'bg-[#170f07] border-[#5a3a18]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#281c12] border border-[#f0d060] flex items-center justify-center">
                      <StampIcon name={boothB.stampIcon} size={18} className="text-[#f0d060]" />
                    </div>
                    <div>
                      <span className="font-pixel text-[9px] text-[#f0d060] font-bold block">
                        SPOT 2 • {boothB.code}
                      </span>
                      <h4 className="font-pixel text-xs text-white truncate max-w-[170px]">
                        {boothB.name}
                      </h4>
                    </div>
                  </div>

                  {participant.completedBooths.includes(boothB.id) ? (
                    <CheckCircle size={20} weight="fill" className="text-[#7ec850] shrink-0" />
                  ) : (
                    <PixelBadge variant="gold" size="sm">
                      +250 XP
                    </PixelBadge>
                  )}
                </div>

                <div className="font-sans text-[11px] text-[#c4956a] border-t border-[#3d2b1e] pt-1.5 flex items-center justify-between">
                  <span>Mekanik: <strong>{getGameTypeLabel(boothB.tipe_game)}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleStartSpot1}
              className="w-full rpg-btn-primary py-4 px-6 text-xs sm:text-sm font-pixel font-bold flex items-center justify-center gap-3 shadow-xl cursor-pointer"
            >
              <Play size={20} weight="fill" />
              <span>MASUK KE SPOT 1 ({boothA.code})</span>
              <ArrowRight size={20} weight="bold" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
