'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  SpeakerHigh,
  SpeakerSimpleSlash,
  Television,
  IdentificationBadge,
  Buildings,
  Info,
  Trophy,
  House,
} from '@phosphor-icons/react';
import { useGameStore } from '@/store/useGameStore';
import { LEVEL_CONFIG } from '@/data/mockData';
import { PixelBadge } from '../ui/PixelBadge';
import { soundEngine } from '@/lib/sound';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const crtEffect = useGameStore((state) => state.crtEffect);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const toggleCrt = useGameStore((state) => state.toggleCrt);
  const currentLevel = useGameStore((state) => state.getCurrentLevel());
  const completedFloors = useGameStore((state) => state.getCompletedFloorsCount());
  const totalStamps = useGameStore((state) => state.getTotalStampsCount());

  const currentLevelData = LEVEL_CONFIG.find((l) => l.level === currentLevel) || LEVEL_CONFIG[0];

  const navLinks = [
    { href: '/', label: 'Beranda', icon: <House size={16} weight="bold" /> },
    { href: '/peta', label: 'Peta Gedung', icon: <Buildings size={16} weight="bold" /> },
    { href: '/paspor', label: 'Paspor Digital', icon: <IdentificationBadge size={16} weight="bold" /> },
    { href: '/bantuan', label: 'Panduan', icon: <Info size={16} weight="bold" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#1c120a]/95 backdrop-blur-md border-b-3 border-[#5a3a18] shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        {/* Brand & Logo */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            onClick={() => soundEnabled && soundEngine.playClick()}
            className="flex items-center gap-2.5 group transition-transform active:scale-95"
          >
            {/* UNU Logo */}
            <div className="p-1 bg-[#2d1b0e] border-2 border-[#8b6f4e] rounded-lg group-hover:border-[#f0d060] transition-colors shadow-inner flex items-center justify-center">
              <Image
                src="/unu.png"
                alt="Logo UNU"
                width={32}
                height={32}
                className="h-7 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-pixel text-xs sm:text-sm font-bold text-[#f0d060] tracking-wider">
                <span>GENIUS</span>
                <span className="text-[#7ec850] text-[10px] font-sans font-bold">• 9 LANTAI</span>
              </div>
              <p className="text-[9px] text-[#a08060] font-pixel tracking-tighter">
                UNU YOGYAKARTA
              </p>
            </div>
          </Link>

          {/* Quick HUD Metrics on Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <PixelBadge variant={completedFloors === 9 ? 'gold' : 'emerald'} size="sm">
              {currentLevelData.badgeIcon} {currentLevel}
            </PixelBadge>
          </div>
        </div>

        {/* Center / Navigation Tabs */}
        <nav className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto py-0.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => soundEnabled && soundEngine.playClick()}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-pixel select-none rounded-lg border-2 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#3d7828] to-[#255018] text-[#f0d060] border-[#f0d060] shadow-[0_2px_8px_rgba(0,0,0,0.5)] font-bold'
                    : 'bg-[#2d1b0e] text-[#f0e0c0] border-[#5a3a18] hover:border-[#8b6f4e] hover:text-[#f0d060] shadow-sm'
                }`}
              >
                {link.icon}
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Stats & Controls */}
        <div className="flex items-center justify-end gap-2.5">
          {/* Level & Floor Stats (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 bg-[#2d1b0e] px-3 py-1.5 border-2 border-[#5a3a18] rounded-lg shadow-sm">
            <div className="flex items-center gap-1 text-[10px] font-pixel text-[#f0d060]">
              <Trophy size={14} weight="fill" />
              <span>{completedFloors}/9 Lt</span>
            </div>
            <span className="text-[#5a3a18]">|</span>
            <div className="text-[10px] font-pixel text-[#7ec850]">
              {totalStamps}/18 Stempel
            </div>
          </div>

          <div className="hidden md:flex items-center">
            <PixelBadge variant={completedFloors === 9 ? 'gold' : 'emerald'} size="sm">
              {currentLevelData.badgeIcon} {currentLevel}
            </PixelBadge>
          </div>

          {/* Sound & CRT Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Matikan Suara (8-bit)' : 'Nyalakan Suara (8-bit)'}
              aria-label="Toggle Audio"
              className={`p-1.5 rounded-lg border-2 transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-[#2d1b0e] text-[#7ec850] border-[#7ec850] shadow-[0_2px_6px_rgba(0,0,0,0.4)]'
                  : 'bg-[#23160c] text-[#a08060] border-[#5a3a18]'
              }`}
            >
              {soundEnabled ? (
                <SpeakerHigh size={16} weight="bold" />
              ) : (
                <SpeakerSimpleSlash size={16} weight="bold" />
              )}
            </button>

            <button
              onClick={toggleCrt}
              title={crtEffect ? 'Matikan Efek Layar Retro CRT' : 'Nyalakan Efek Layar Retro CRT'}
              aria-label="Toggle CRT Screen"
              className={`p-1.5 rounded-lg border-2 transition-all cursor-pointer ${
                crtEffect
                  ? 'bg-[#2d1b0e] text-[#f0d060] border-[#f0d060] shadow-[0_2px_6px_rgba(0,0,0,0.4)]'
                  : 'bg-[#23160c] text-[#a08060] border-[#5a3a18]'
              }`}
            >
              <Television size={16} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
