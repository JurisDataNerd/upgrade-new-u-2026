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
    <div className="min-h-screen flex flex-col bg-[#2d1b0e] text-[#f0e0c0]">
      <CrtScanlines />
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 space-y-6">
        {/* Simple Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-[#14230f] border border-[#7ec850] rounded-full px-3 py-0.5 text-[10px] font-pixel text-[#7ec850]">
            <Info size={14} weight="bold" />
            <span>PANDUAN SINGKAT</span>
          </div>
          <h1 className="font-pixel text-lg sm:text-2xl font-bold text-[#f0d060]">
            CARA BERMAIN GENIUS
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#c4956a]">
            Jelajahi 9 lantai gedung kampus UNU Yogya dan kumpulkan 18 stempel digital.
          </p>
        </div>

        {/* 3 Simple Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#170f07] p-4 rounded-xl border border-[#5a3a18] space-y-2 text-center sm:text-left">
            <div className="w-8 h-8 rounded-lg bg-[#23160c] border border-[#7ec850] text-[#7ec850] font-pixel text-xs font-bold flex items-center justify-center mx-auto sm:mx-0">
              1
            </div>
            <h3 className="font-pixel text-xs font-bold text-white">
              Buka Prolog Lantai
            </h3>
            <p className="font-sans text-xs text-[#a08060] leading-relaxed">
              Mulai dari Lantai 1. Pahami tema dan poin misi karakter sebelum masuk ke spot.
            </p>
          </div>

          <div className="bg-[#170f07] p-4 rounded-xl border border-[#5a3a18] space-y-2 text-center sm:text-left">
            <div className="w-8 h-8 rounded-lg bg-[#23160c] border border-[#f0d060] text-[#f0d060] font-pixel text-xs font-bold flex items-center justify-center mx-auto sm:mx-0">
              2
            </div>
            <h3 className="font-pixel text-xs font-bold text-white">
              Mainkan 2 Spot
            </h3>
            <p className="font-sans text-xs text-[#a08060] leading-relaxed">
              Tiap lantai punya 2 spot mini-game (TTS, Tebak Kata, Memory Match, dll).
            </p>
          </div>

          <div className="bg-[#170f07] p-4 rounded-xl border border-[#5a3a18] space-y-2 text-center sm:text-left">
            <div className="w-8 h-8 rounded-lg bg-[#23160c] border border-[#60a8d8] text-[#60a8d8] font-pixel text-xs font-bold flex items-center justify-center mx-auto sm:mx-0">
              3
            </div>
            <h3 className="font-pixel text-xs font-bold text-white">
              Koleksi 18 Stempel
            </h3>
            <p className="font-sans text-xs text-[#a08060] leading-relaxed">
              Tuntaskan seluruh 9 lantai untuk klaim paspor lengkap & sertifikat kelulusan.
            </p>
          </div>
        </div>

        {/* 6 Mini-Game Types Compact List */}
        <div className="sdv-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-pixel text-[#f0d060] border-b border-[#5a3a18] pb-2.5">
            <GameController size={16} weight="bold" />
            <span>6 TIPE MINI-GAME</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-sans">
            <div className="bg-[#170f07] p-2.5 rounded-lg border border-[#3d2b1e] flex items-center gap-2">
              <Sparkle size={14} weight="fill" className="text-[#7ec850] shrink-0" />
              <span className="text-[#f0e0c0]">Teka-Teki Silang (TTS)</span>
            </div>
            <div className="bg-[#170f07] p-2.5 rounded-lg border border-[#3d2b1e] flex items-center gap-2">
              <Sparkle size={14} weight="fill" className="text-[#f0d060] shrink-0" />
              <span className="text-[#f0e0c0]">Tebak Kata</span>
            </div>
            <div className="bg-[#170f07] p-2.5 rounded-lg border border-[#3d2b1e] flex items-center gap-2">
              <MapPin size={14} weight="fill" className="text-[#60a8d8] shrink-0" />
              <span className="text-[#f0e0c0]">Tebak Posisi Kampus</span>
            </div>
            <div className="bg-[#170f07] p-2.5 rounded-lg border border-[#3d2b1e] flex items-center gap-2">
              <Cards size={14} weight="fill" className="text-[#f0a030] shrink-0" />
              <span className="text-[#f0e0c0]">Memory Match Kartu</span>
            </div>
            <div className="bg-[#170f07] p-2.5 rounded-lg border border-[#3d2b1e] flex items-center gap-2">
              <Lightning size={14} weight="fill" className="text-[#e0a040] shrink-0" />
              <span className="text-[#f0e0c0]">Kuis Cepat Timer</span>
            </div>
            <div className="bg-[#170f07] p-2.5 rounded-lg border border-[#3d2b1e] flex items-center gap-2">
              <ShieldCheck size={14} weight="fill" className="text-[#7ec850] shrink-0" />
              <span className="text-[#f0e0c0]">Uji Benar / Salah</span>
            </div>
          </div>
        </div>

        {/* Quick Actions CTA */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/play" className="flex-1">
            <button
              onClick={() => soundEnabled && soundEngine.playClick()}
              className="w-full rpg-btn-primary py-3.5 px-4 text-xs font-pixel font-bold flex items-center justify-center gap-2"
            >
              <Play size={16} weight="fill" />
              <span>Mulai Petualangan</span>
            </button>
          </Link>

          <Link href="/paspor" className="flex-1">
            <button
              onClick={() => soundEnabled && soundEngine.playClick()}
              className="w-full rpg-btn-wood py-3.5 px-4 text-xs font-pixel font-bold flex items-center justify-center gap-2"
            >
              <IdentificationBadge size={16} weight="bold" />
              <span>Lihat Paspor Digital</span>
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
