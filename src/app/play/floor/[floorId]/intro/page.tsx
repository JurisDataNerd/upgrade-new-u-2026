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
    <div className="min-h-[100dvh] h-[100dvh] max-h-[100dvh] flex flex-col bg-[#2d1b0e] text-[#f0e0c0] w-full overflow-hidden">
      <CrtScanlines />
      <Navbar />

      <main className="max-w-2xl mx-auto px-2.5 sm:px-6 py-2 sm:py-3 flex-1 flex flex-col justify-between overflow-hidden w-full gap-2">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between shrink-0">
          <Link
            href="/peta"
            onClick={() => soundEnabled && soundEngine.playClick()}
            className="inline-flex items-center gap-1.5 text-[11px] font-pixel text-[#c4956a] hover:text-[#f0d060] transition-colors"
          >
            <ArrowLeft size={14} weight="bold" />
            <span>Peta</span>
          </Link>

          <div className="flex items-center gap-1.5">
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

        {/* Main Floor Banner Card (Compact Fit-to-screen) */}
        <div className="flex-1 sdv-card-gold p-3 sm:p-5 flex flex-col justify-between overflow-hidden text-center shadow-xl">
          {/* Header Title */}
          <div className="space-y-0.5 shrink-0">
            <div className="inline-flex items-center gap-1 font-pixel text-[8px] sm:text-[9px] text-[#7ec850] uppercase tracking-wider bg-[#170f07] px-2.5 py-0.5 rounded-full border border-[#5a3a18]">
              <Buildings size={12} weight="fill" className="text-[#f0d060]" />
              <span>ZONA EKSPLORASI KAMPUS</span>
            </div>
            <h1 className="font-pixel text-sm sm:text-lg font-bold text-white tracking-wide mt-1 leading-snug break-words">
              {floor.name}
            </h1>
            <p className="font-pixel text-[9px] sm:text-[10px] text-[#f0d060] leading-normal break-words">
              {floor.theme}
            </p>
          </div>

          {/* Interactive Portal + Dialogue Row */}
          <div className="my-1.5 flex items-center gap-2.5 sm:gap-4 text-left bg-[#170f07] p-2.5 sm:p-3 border-2 border-[#5a3a18] rounded-xl shadow-inner shrink-0">
            {/* Interactive Circular Building Portal Thumbnail */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={handlePortalTap}
                title="Klik portal gedung"
                className={`w-14 h-14 sm:w-18 sm:h-18 rounded-full p-1 bg-gradient-to-b from-[#f0d060] to-[#5a3a18] shadow-md transition-transform cursor-pointer relative overflow-hidden ${
                  isPortalPulsing ? 'scale-105' : 'hover:scale-105'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden relative border-2 border-[#2d1b0e]">
                  <Image
                    src="/unu-hero.jpeg"
                    alt={`Gedung Lantai ${floor.number}`}
                    fill
                    priority
                    className="object-cover object-center filter brightness-[0.9]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1c120a]/80 via-transparent to-black/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-pixel text-[7px] sm:text-[9px] text-[#f0d060] font-black bg-[#170f07]/90 px-1.5 py-0.5 rounded border border-[#f0d060]">
                      L{floor.number}
                    </span>
                  </div>
                </div>
              </button>

              {floorStatus === 'completed' && (
                <div className="absolute -top-1 -right-1 bg-[#7ec850] text-[#1b120a] p-0.5 rounded-full shadow border border-[#1c120a]">
                  <CheckCircle size={14} weight="fill" />
                </div>
              )}
            </div>

            {/* Character Dialogue Quote */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="w-5 h-5 rounded-md overflow-hidden bg-[#281c12] border border-[#f0d060] shrink-0 relative">
                  <Image
                    src={selectedAvatar.avatarImage}
                    alt={selectedAvatar.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="font-pixel text-[9px] text-[#f0d060] font-bold">
                  {participant.name}
                </span>
                <span className="text-[8px] font-pixel text-[#7ec850]">• Misi Lantai</span>
              </div>
              <p className="font-sans text-[11px] sm:text-xs text-[#d0c0a0] leading-relaxed text-justify break-words">
                &ldquo;{floor.storyIntro?.narrative || floor.description}&rdquo;
              </p>
            </div>
          </div>

          {/* 2 Spots Grid Preview */}
          <div className="space-y-1.5 text-left py-1">
            <div className="flex items-center justify-between px-1">
              <span className="font-pixel text-[8px] sm:text-[9px] text-[#a08060] uppercase">
                Tantangan di Lantai Ini:
              </span>
              <span className="font-pixel text-[8px] sm:text-[9px] text-[#7ec850]">
                Total: +500 XP & 2 Stempel
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Spot 1 */}
              <div
                className={`p-2 rounded-xl border transition-all ${
                  participant.completedBooths.includes(boothA.id)
                    ? 'bg-[#1a2e1a] border-[#7ec850]'
                    : 'bg-[#170f07] border-[#5a3a18]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-[#281c12] border border-[#f0d060] flex items-center justify-center shrink-0">
                      <StampIcon name={boothA.stampIcon} size={14} className="text-[#f0d060]" />
                    </div>
                    <span className="font-pixel text-[8px] text-[#7ec850] font-bold">
                      {boothA.code}
                    </span>
                  </div>

                  {participant.completedBooths.includes(boothA.id) ? (
                    <CheckCircle size={14} weight="fill" className="text-[#7ec850] shrink-0" />
                  ) : (
                    <span className="text-[8px] font-pixel text-[#f0d060] bg-[#281c12] px-1 py-0.5 rounded border border-[#5a3a18]">
                      +250 XP
                    </span>
                  )}
                </div>

                <h4 className="font-pixel text-[9px] sm:text-[10px] font-bold text-white leading-normal break-words mt-0.5">
                  {boothA.name}
                </h4>
                <div className="text-[9px] font-sans text-[#c4956a] mt-0.5">
                  {getGameTypeLabel(boothA.tipe_game)}
                </div>
              </div>

              {/* Spot 2 */}
              <div
                className={`p-2 rounded-xl border transition-all ${
                  participant.completedBooths.includes(boothB.id)
                    ? 'bg-[#1a2e1a] border-[#7ec850]'
                    : 'bg-[#170f07] border-[#5a3a18]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-[#281c12] border border-[#f0d060] flex items-center justify-center shrink-0">
                      <StampIcon name={boothB.stampIcon} size={14} className="text-[#f0d060]" />
                    </div>
                    <span className="font-pixel text-[8px] text-[#f0d060] font-bold">
                      {boothB.code}
                    </span>
                  </div>

                  {participant.completedBooths.includes(boothB.id) ? (
                    <CheckCircle size={14} weight="fill" className="text-[#7ec850] shrink-0" />
                  ) : (
                    <span className="text-[8px] font-pixel text-[#f0d060] bg-[#281c12] px-1 py-0.5 rounded border border-[#5a3a18]">
                      +250 XP
                    </span>
                  )}
                </div>

                <h4 className="font-pixel text-[9px] sm:text-[10px] font-bold text-white leading-normal break-words mt-0.5">
                  {boothB.name}
                </h4>
                <div className="text-[9px] font-sans text-[#c4956a] mt-0.5">
                  {getGameTypeLabel(boothB.tipe_game)}
                </div>
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="pt-1 shrink-0">
            <button
              type="button"
              onClick={handleStartSpot1}
              className="w-full rpg-btn-primary py-2.5 sm:py-3.5 px-4 text-xs sm:text-sm font-pixel font-bold flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              <Play size={16} weight="fill" />
              <span>MASUK KE SPOT 1 ({boothA.code})</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
