'use client';

import React from 'react';
import Link from 'next/link';
import {
  Info,
  ArrowRight,
  Sparkle,
  Cards,
  Lightning,
  ShieldCheck,
  MapPin,
  GameController,
  Play,
  IdentificationBadge,
} from '@phosphor-icons/react';
import { Navbar } from '@/components/layout/Navbar';
import { CrtScanlines } from '@/components/layout/CrtScanlines';
import { soundEngine } from '@/lib/sound';
import { useGameStore } from '@/store/useGameStore';

export default function BantuanPage() {
  const soundEnabled = useGameStore((state) => state.soundEnabled);

  return (
    <div className="min-h-[100dvh] h-[100dvh] max-h-[100dvh] flex flex-col bg-[#2d1b0e] text-[#f0e0c0] overflow-hidden">
      <CrtScanlines />
      <Navbar />

      <main className="max-w-2xl mx-auto px-2.5 sm:px-6 py-2 sm:py-3 flex-1 flex flex-col justify-between overflow-hidden w-full gap-2">
        {/* Simple Header */}
        <div className="text-center space-y-0.5 shrink-0">
          <div className="inline-flex items-center gap-1 bg-[#14230f] border border-[#7ec850] rounded-full px-2.5 py-0.5 text-[8px] sm:text-[9px] font-pixel text-[#7ec850]">
            <Info size={12} weight="bold" />
            <span>PANDUAN SINGKAT</span>
          </div>
          <h1 className="font-pixel text-sm sm:text-lg font-bold text-[#f0d060] mt-0.5">
            CARA BERMAIN GENIUS
          </h1>
          <p className="font-sans text-[11px] sm:text-xs text-[#c4956a] truncate">
            Jelajahi 9 lantai gedung kampus UNU dan kumpulkan 18 stempel digital.
          </p>
        </div>

        {/* 3 Simple Steps Grid */}
        <div className="grid grid-cols-3 gap-1.5 shrink-0">
          <div className="bg-[#170f07] p-2 rounded-xl border border-[#5a3a18] space-y-1 text-center">
            <div className="w-6 h-6 rounded-md bg-[#23160c] border border-[#7ec850] text-[#7ec850] font-pixel text-[10px] font-bold flex items-center justify-center mx-auto">
              1
            </div>
            <h3 className="font-pixel text-[9px] sm:text-[10px] font-bold text-white truncate">
              Prolog Lantai
            </h3>
            <p className="font-sans text-[9px] sm:text-[10px] text-[#a08060] leading-tight line-clamp-2">
              Buka tema & misi karakter.
            </p>
          </div>

          <div className="bg-[#170f07] p-2 rounded-xl border border-[#5a3a18] space-y-1 text-center">
            <div className="w-6 h-6 rounded-md bg-[#23160c] border border-[#f0d060] text-[#f0d060] font-pixel text-[10px] font-bold flex items-center justify-center mx-auto">
              2
            </div>
            <h3 className="font-pixel text-[9px] sm:text-[10px] font-bold text-white truncate">
              2 Spot Game
            </h3>
            <p className="font-sans text-[9px] sm:text-[10px] text-[#a08060] leading-tight line-clamp-2">
              Mainkan TTS, Kuis, Memory.
            </p>
          </div>

          <div className="bg-[#170f07] p-2 rounded-xl border border-[#5a3a18] space-y-1 text-center">
            <div className="w-6 h-6 rounded-md bg-[#23160c] border border-[#60a8d8] text-[#60a8d8] font-pixel text-[10px] font-bold flex items-center justify-center mx-auto">
              3
            </div>
            <h3 className="font-pixel text-[9px] sm:text-[10px] font-bold text-white truncate">
              18 Stempel
            </h3>
            <p className="font-sans text-[9px] sm:text-[10px] text-[#a08060] leading-tight line-clamp-2">
              Klaim paspor & sertifikat.
            </p>
          </div>
        </div>

        {/* 6 Mini-Game Types Compact List */}
        <div className="flex-1 sdv-card p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden shadow-lg">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-pixel text-[#f0d060] border-b border-[#5a3a18] pb-1.5 shrink-0">
            <GameController size={14} weight="bold" />
            <span>6 TIPE MINI-GAME</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px] sm:text-xs font-sans py-1">
            <div className="bg-[#170f07] p-2 rounded-lg border border-[#3d2b1e] flex items-center gap-1.5">
              <Sparkle size={12} weight="fill" className="text-[#7ec850] shrink-0" />
              <span className="text-[#f0e0c0] truncate">TTS Kampus</span>
            </div>
            <div className="bg-[#170f07] p-2 rounded-lg border border-[#3d2b1e] flex items-center gap-1.5">
              <Sparkle size={12} weight="fill" className="text-[#f0d060] shrink-0" />
              <span className="text-[#f0e0c0] truncate">Tebak Kata</span>
            </div>
            <div className="bg-[#170f07] p-2 rounded-lg border border-[#3d2b1e] flex items-center gap-1.5">
              <MapPin size={12} weight="fill" className="text-[#60a8d8] shrink-0" />
              <span className="text-[#f0e0c0] truncate">Tebak Posisi</span>
            </div>
            <div className="bg-[#170f07] p-2 rounded-lg border border-[#3d2b1e] flex items-center gap-1.5">
              <Cards size={12} weight="fill" className="text-[#f0a030] shrink-0" />
              <span className="text-[#f0e0c0] truncate">Memory Match</span>
            </div>
            <div className="bg-[#170f07] p-2 rounded-lg border border-[#3d2b1e] flex items-center gap-1.5">
              <Lightning size={12} weight="fill" className="text-[#e0a040] shrink-0" />
              <span className="text-[#f0e0c0] truncate">Kuis Cepat</span>
            </div>
            <div className="bg-[#170f07] p-2 rounded-lg border border-[#3d2b1e] flex items-center gap-1.5">
              <ShieldCheck size={12} weight="fill" className="text-[#7ec850] shrink-0" />
              <span className="text-[#f0e0c0] truncate">Benar / Salah</span>
            </div>
          </div>

          <div className="text-[9px] font-sans text-[#a08060] text-center border-t border-[#3d2b1e] pt-1 shrink-0">
            Setiap tantangan yang selesai akan otomatis menambahkan stempel & XP!
          </div>
        </div>

        {/* Quick Actions CTA */}
        <div className="flex gap-2 pt-0.5 shrink-0">
          <Link href="/play" className="flex-1">
            <button
              onClick={() => soundEnabled && soundEngine.playClick()}
              className="w-full rpg-btn-primary py-2.5 px-3 text-xs font-pixel font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play size={14} weight="fill" />
              <span>Mulai Main</span>
            </button>
          </Link>

          <Link href="/paspor" className="flex-1">
            <button
              onClick={() => soundEnabled && soundEngine.playClick()}
              className="w-full rpg-btn-wood py-2.5 px-3 text-xs font-pixel font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <IdentificationBadge size={14} weight="bold" />
              <span>Lihat Paspor</span>
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
