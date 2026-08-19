'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  SpeakerHigh,
  SpeakerSimpleSlash,
  Television,
  IdentificationBadge,
  Buildings,
  Trophy,
  House,
  GameController,
  List,
  X,
} from '@phosphor-icons/react';
import { useGameStore } from '@/store/useGameStore';
import { PixelBadge } from '../ui/PixelBadge';
import { soundEngine } from '@/lib/sound';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const crtEffect = useGameStore((state) => state.crtEffect);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const toggleCrt = useGameStore((state) => state.toggleCrt);
  const currentLevel = useGameStore((state) => state.getCurrentLevel());
  const completedFloors = useGameStore((state) => state.getCompletedFloorsCount());
  const totalStamps = useGameStore((state) => state.getTotalStampsCount());

  const navLinks = [
    { href: '/', label: 'Beranda', icon: <House size={18} weight="bold" /> },
    { href: '/play', label: 'Main', icon: <GameController size={18} weight="bold" /> },
    { href: '/peta', label: 'Peta', icon: <Buildings size={18} weight="bold" /> },
    { href: '/leaderboard', label: 'Peringkat', icon: <Trophy size={18} weight="bold" /> },
    { href: '/paspor', label: 'Paspor', icon: <IdentificationBadge size={18} weight="bold" /> },
  ];

  const handleLinkClick = () => {
    if (soundEnabled) soundEngine.playClick();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#1c120a] border-b-2 border-[#5a3a18] shadow-lg">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Brand & Logo */}
        <Link
          href="/"
          onClick={handleLinkClick}
          className="flex items-center gap-2 group shrink-0"
        >
          <div className="p-1 bg-[#2d1b0e] border border-[#8b6f4e] rounded-lg group-hover:border-[#f0d060] transition-colors flex items-center justify-center">
            <Image
              src="/unu.png"
              alt="UNU"
              width={26}
              height={26}
              className="h-6 w-auto object-contain"
            />
          </div>
          <div>
            <div className="font-pixel text-xs sm:text-sm font-bold text-[#f0d060] tracking-wider">
              GENIUS
            </div>
            <p className="text-[8px] text-[#a08060] font-pixel">
              UNU YOGYA
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href === '/play' && pathname.startsWith('/play'));

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-pixel rounded-lg border transition-all ${
                  isActive
                    ? 'bg-[#3d7828] text-[#f0d060] border-[#f0d060] font-bold shadow'
                    : 'bg-[#2d1b0e] text-[#f0e0c0] border-[#5a3a18] hover:border-[#8b6f4e] hover:text-[#f0d060]'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Controls & Hamburger Button */}
        <div className="flex items-center gap-2">
          {/* Quick Stats (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 bg-[#2d1b0e] px-2.5 py-1 border border-[#5a3a18] rounded-lg text-xs font-pixel">
            <span className="text-[#f0d060]">{completedFloors}/9 Lt</span>
            <span className="text-[#5a3a18]">•</span>
            <span className="text-[#7ec850]">{totalStamps}/18 Stempel</span>
          </div>

          <div className="hidden sm:flex">
            <PixelBadge variant={completedFloors === 9 ? 'gold' : 'emerald'} size="sm">
              {currentLevel}
            </PixelBadge>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-[#2d1b0e] text-[#7ec850] border-[#7ec850]'
                : 'bg-[#23160c] text-[#a08060] border-[#5a3a18]'
            }`}
          >
            {soundEnabled ? (
              <SpeakerHigh size={18} weight="bold" />
            ) : (
              <SpeakerSimpleSlash size={18} weight="bold" />
            )}
          </button>

          {/* CRT Toggle (Desktop only to save mobile space) */}
          <button
            onClick={toggleCrt}
            title="Efek Layar"
            className={`hidden sm:block p-1.5 rounded-lg border transition-all cursor-pointer ${
              crtEffect
                ? 'bg-[#2d1b0e] text-[#f0d060] border-[#f0d060]'
                : 'bg-[#23160c] text-[#a08060] border-[#5a3a18]'
            }`}
          >
            <Television size={18} weight="bold" />
          </button>

          {/* Mobile Hamburger Burger Button */}
          <button
            type="button"
            onClick={() => {
              if (soundEnabled) soundEngine.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="md:hidden p-1.5 bg-[#2d1b0e] text-[#f0d060] border-2 border-[#8b6f4e] hover:border-[#f0d060] rounded-lg transition-all cursor-pointer flex items-center justify-center"
            aria-label="Menu Navigasi"
          >
            {mobileMenuOpen ? (
              <X size={20} weight="bold" />
            ) : (
              <List size={20} weight="bold" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Menu (No horizontal scroll!) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#170f07] border-t-2 border-[#5a3a18] px-4 py-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150 shadow-2xl">
          <div className="text-[9px] font-pixel text-[#a08060] uppercase px-1 pb-1 border-b border-[#3d2b1e]">
            Menu Utama
          </div>

          <div className="space-y-1.5 pt-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href === '/play' && pathname.startsWith('/play'));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-pixel text-xs border transition-all ${
                    isActive
                      ? 'bg-[#3d7828] text-[#f0d060] border-[#f0d060] font-bold shadow'
                      : 'bg-[#23160c] text-[#f0e0c0] border-[#3d2b1e] hover:bg-[#2d1b0e]'
                  }`}
                >
                  <span className="text-[#f0d060]">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#3d2b1e] flex items-center justify-between text-xs font-pixel text-[#a08060] px-1">
            <span>Level: <strong className="text-[#f0d060]">{currentLevel}</strong></span>
            <span>{completedFloors}/9 Lantai • {totalStamps}/18 Stempel</span>
          </div>
        </div>
      )}
    </header>
  );
};
