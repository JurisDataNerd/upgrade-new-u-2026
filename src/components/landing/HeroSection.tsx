'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkle,
  GameController,
  IdentificationBadge,
  Info,
  Buildings,
  CheckCircle,
  X,
  SpeakerHigh,
  SpeakerSimpleSlash,
  Television,
  GenderMale,
  GenderFemale,
} from '@phosphor-icons/react';
import { useGameStore } from '@/store/useGameStore';
import { AVATAR_OPTIONS } from '@/data/mockData';
import { soundEngine } from '@/lib/sound';

export const HeroSection: React.FC = () => {
  const participant = useGameStore((state) => state.participant);
  const setParticipantInfo = useGameStore((state) => state.setParticipantInfo);
  const completedFloors = useGameStore((state) => state.getCompletedFloorsCount());
  const totalStamps = useGameStore((state) => state.getTotalStampsCount());
  const currentLevel = useGameStore((state) => state.getCurrentLevel());
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const crtEffect = useGameStore((state) => state.crtEffect);
  const toggleCrt = useGameStore((state) => state.toggleCrt);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [tempName, setTempName] = useState(participant.name);
  const [tempNim, setTempNim] = useState(participant.nim);
  const [tempProdi, setTempProdi] = useState(participant.prodi);
  const [tempAvatar, setTempAvatar] = useState(participant.avatar);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setParticipantInfo({
      name: tempName,
      nim: tempNim,
      prodi: tempProdi,
      avatar: tempAvatar,
    });
    if (soundEnabled) soundEngine.playCorrect();
    setIsProfileModalOpen(false);
  };

  const handleSelectQuickAvatar = (avatarId: string) => {
    setTempAvatar(avatarId);
    setParticipantInfo({ avatar: avatarId });
    if (soundEnabled) soundEngine.playSelect();
  };

  return (
    <div className="relative w-full min-h-[100dvh] flex flex-col justify-between overflow-hidden select-none">
      {/* Background Image: Bright & Clearly Visible UNU Campus 9 Floors Building */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/unu-hero.jpeg"
          alt="Gedung Kampus UNU Yogyakarta 9 Lantai"
          fill
          priority
          className="object-cover object-center filter brightness-[0.88] contrast-[1.05] saturate-[1.05] animate-ken-burns"
        />
        {/* Soft, translucent warm gradient overlay so building stays clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#120b06]/70 via-transparent to-[#160d07]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(18,11,6,0.35)_100%)] pointer-events-none" />
      </div>

      {/* Top Bar: Institutional Logo & Audio Controls */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-5 flex items-center justify-between gap-4">
        {/* Partner / Institution Badge (Matching Seeds of Hope top-left logos pill) */}
        <div className="backdrop-blur-md bg-[#140e0a]/85 border border-[#f0d060]/50 rounded-full px-4 sm:px-6 py-2 flex items-center gap-3 sm:gap-4 shadow-xl">
          <Image
            src="/unu.png"
            alt="Logo UNU Yogyakarta"
            width={120}
            height={42}
            priority
            className="h-8 sm:h-9 w-auto object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          />
          <div className="w-[1px] h-6 sm:h-7 bg-[#f0d060]/40" />
          <div className="flex flex-col text-left">
            <span className="font-pixel text-[9px] sm:text-[11px] text-[#f0d060] font-bold tracking-wider">
              UNU YOGYAKARTA
            </span>
            <span className="font-sans text-[10px] sm:text-xs text-[#a0d870] font-medium">
              Orientasi Mahasiswa Baru
            </span>
          </div>
        </div>

        {/* Top Right Quick Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Matikan Suara 8-Bit' : 'Nyalakan Suara 8-Bit'}
            className="p-2 sm:p-2.5 bg-[#2d1b0e]/90 border-2 border-[#8b6f4e] hover:border-[#f0d060] rounded-lg text-[#f0d060] transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {soundEnabled ? (
              <SpeakerHigh size={18} weight="bold" />
            ) : (
              <SpeakerSimpleSlash size={18} weight="bold" />
            )}
          </button>

          <button
            onClick={toggleCrt}
            title={crtEffect ? 'Matikan Layar CRT' : 'Nyalakan Layar CRT'}
            className="p-2 sm:p-2.5 bg-[#2d1b0e]/90 border-2 border-[#8b6f4e] hover:border-[#f0d060] rounded-lg text-[#f0d060] transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Television size={18} weight="bold" />
          </button>

          <Link href="/bantuan" className="hidden sm:inline-block">
            <button
              onClick={() => soundEnabled && soundEngine.playClick()}
              className="p-2 sm:p-2.5 bg-[#2d1b0e]/90 border-2 border-[#8b6f4e] hover:border-[#f0d060] rounded-lg text-[#f0d060] transition-all shadow-md active:scale-95 cursor-pointer"
              title="Panduan Petualang"
            >
              <Info size={18} weight="bold" />
            </button>
          </Link>
        </div>
      </div>

      {/* Main Menu Center Content (Seeds of Hope Layout) */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col items-center justify-center text-center">
        {/* Top Announcement Badge */}
        <div className="mb-3 inline-block">
          <div className="backdrop-blur-md bg-[#14230f]/90 border border-[#7ec850] text-[#7ec850] font-pixel text-[9px] sm:text-[11px] px-4 py-1.5 rounded-full tracking-widest uppercase shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center gap-2">
            <Sparkle size={14} weight="fill" className="text-[#f0d060] animate-spin" />
            <span>ORIENTASI MAHASISWA BARU 2026</span>
          </div>
        </div>

        {/* Grand Title with multi-layered gold drop shadow */}
        <div className="space-y-1.5 mb-5">
          <h1
            className="font-pixel text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#f0d060] tracking-[8px] sm:tracking-[12px] animate-title-pulse drop-shadow-[0_10px_20px_rgba(0,0,0,0.95)]"
            style={{
              textShadow:
                '3px 3px 0 #6b4f2e, 6px 6px 0 #1b120a, 0 0 30px rgba(240, 208, 96, 0.5)',
            }}
          >
            GENIUS
          </h1>
          <div
            className="font-pixel text-base sm:text-2xl md:text-3xl text-white tracking-[4px] sm:tracking-[6px]"
            style={{
              textShadow: '2px 2px 0 #2d1b0e, 0 2px 10px rgba(0,0,0,0.9)',
            }}
          >
            UPGRADE NEW YOU
          </div>
          <p
            className="font-pixel text-[10px] sm:text-xs text-[#a0d870] tracking-[2px] pt-1"
            style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.9)' }}
          >
            EKSPLORASI GEDUNG KAMPUS 9 LANTAI • 18 CORNER KARAKTER
          </p>
        </div>

        {/* Character Quick-Select Bar (Cowok / Cewek) */}
        <div className="backdrop-blur-md bg-[#19120c]/85 border border-[#8b6f4e] rounded-xl p-2.5 mb-5 max-w-md w-full shadow-lg">
          <div className="flex items-center justify-between gap-2 px-1 mb-2">
            <span className="font-pixel text-[9px] text-[#f0d060] uppercase">
              Karakter Utama Anda:
            </span>
            <button
              onClick={() => {
                if (soundEnabled) soundEngine.playClick();
                setIsProfileModalOpen(true);
              }}
              className="text-[10px] font-sans text-[#c4956a] hover:text-[#f0d060] underline cursor-pointer"
            >
              Ubah Data Diri
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {AVATAR_OPTIONS.map((av) => {
              const isSelected = participant.avatar === av.id;
              return (
                <button
                  key={av.id}
                  onClick={() => handleSelectQuickAvatar(av.id)}
                  className={`p-2 rounded-lg border-2 text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#3d7828] to-[#255018] border-[#f0d060] shadow-[0_0_12px_rgba(126,200,80,0.4)]'
                      : 'bg-[#170f07]/80 border-[#5a3a18] hover:border-[#8b6f4e]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#170f07] border border-[#f0d060] shrink-0 relative">
                    <Image
                      src={av.avatarImage}
                      alt={av.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-pixel text-[9px] text-white font-bold truncate flex items-center gap-1">
                      <span>{av.gender === 'pria' ? 'Cowok' : 'Cewek'}</span>
                      {av.gender === 'pria' ? (
                        <GenderMale size={12} weight="bold" className="text-[#60a8d8]" />
                      ) : (
                        <GenderFemale size={12} weight="bold" className="text-[#ff8080]" />
                      )}
                    </div>
                    <div className="font-sans text-[10px] text-[#c4956a] truncate">
                      {av.gender === 'pria' ? 'Peci & Jas UNU' : 'Hijab & Jas UNU'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Action Buttons Stack (Seeds of Hope width & 3D bevels) */}
        <div className="w-full max-w-sm flex flex-col items-center gap-3 my-1">
          {/* Primary Action Button */}
          <Link href="/peta" className="w-full">
            <button
              onClick={() => soundEnabled && soundEngine.playClick()}
              className="w-full py-4 px-6 text-xs sm:text-sm font-pixel font-bold uppercase tracking-wider rpg-btn-primary flex items-center justify-center gap-3"
            >
              <GameController size={20} weight="bold" />
              <span>{totalStamps > 0 ? 'LANJUTKAN PENJELAJAHAN' : 'MULAI PERJALANAN'}</span>
            </button>
          </Link>

          {/* Paspor Digital Button */}
          <Link href="/paspor" className="w-full">
            <button
              onClick={() => soundEnabled && soundEngine.playClick()}
              className="w-full py-3.5 px-6 text-xs sm:text-sm font-pixel font-bold uppercase tracking-wider rpg-btn-wood flex items-center justify-center gap-3"
            >
              <IdentificationBadge size={20} weight="bold" />
              <span>PASPOR DIGITAL ({totalStamps}/18)</span>
            </button>
          </Link>

          {/* Guide Button (Mobile) */}
          <Link href="/bantuan" className="w-full sm:hidden">
            <button
              onClick={() => soundEnabled && soundEngine.playClick()}
              className="w-full py-3 px-6 text-[11px] font-pixel font-bold uppercase tracking-wider bg-[#2d1b0e]/90 border-2 border-[#5a3a18] rounded-lg text-[#f0e0c0] hover:border-[#f0d060] flex items-center justify-center gap-2"
            >
              <Info size={16} weight="bold" />
              <span>PETUNJUK & CARA BERMAIN</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Bottom Footer & Campus Stats Card (Seeds of Hope Awards Card layout) */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-5 pt-1">
        <div className="backdrop-blur-md bg-[#19120c]/90 border-2 border-[#8b6f4e] rounded-xl p-3.5 text-center shadow-2xl space-y-2">
          {/* Institutional Branding Line */}
          <div className="flex items-center justify-center gap-3">
            <Image
              src="/unu.png"
              alt="UNU Logo"
              width={60}
              height={22}
              className="h-5 w-auto object-contain opacity-90"
            />
            <span className="font-sans text-xs sm:text-sm text-[#e0d0b0]">
              <strong className="text-[#f0d060]">Universitas Nahdlatul Ulama Yogyakarta</strong> • Transformasi Karakter Insan Unggul
            </span>
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 font-sans text-xs">
            <div className="bg-[#281e14] border border-[#d4a57a] rounded-full px-3 py-0.5 text-white flex items-center gap-1.5 shadow-sm">
              <Buildings size={14} weight="fill" className="text-[#7ec850]" />
              <span><strong>9 Lantai</strong> Eksplorasi</span>
            </div>

            <div className="bg-[#281e14] border border-[#d4a57a] rounded-full px-3 py-0.5 text-white flex items-center gap-1.5 shadow-sm">
              <Sparkle size={14} weight="fill" className="text-[#f0d060]" />
              <span><strong>18 Corner</strong> Karakter</span>
            </div>

            <div className="bg-[#281e14] border border-[#d4a57a] rounded-full px-3 py-0.5 text-white flex items-center gap-1.5 shadow-sm">
              <span>👑</span>
              <span>Level: <strong className="text-[#f0d060]">{currentLevel}</strong></span>
            </div>

            <div className="bg-[#281e14] border border-[#d4a57a] rounded-full px-3 py-0.5 text-white flex items-center gap-1.5 shadow-sm">
              <CheckCircle size={14} weight="fill" className="text-[#7ec850]" />
              <span>{completedFloors}/9 Lantai Tuntas</span>
            </div>
          </div>

          <div className="font-pixel text-[8px] text-[#8b6f4e] uppercase tracking-wider">
            GENIUS PROTOTYPE • UNU YOGYAKARTA © 2026
          </div>
        </div>
      </div>

      {/* Character Selector & Profile RPG Dialogue Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0604]/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-gradient-to-b from-[#2d1b0e] to-[#1a1008] border-[3.5px] border-[#f0d060] rounded-2xl p-6 sm:p-7 shadow-[inset_0_0_0_3px_#6b4f2e,0_16px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(240,208,96,0.25)] relative">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-4 right-4 text-[#f0d060] hover:text-white bg-[#3d2b1e] border-2 border-[#8b6f4e] hover:border-[#f0d060] rounded-md w-8 h-8 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer font-pixel text-xs"
            >
              <X size={16} weight="bold" />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-1 mb-5">
              <div className="inline-block bg-[#14230f] border border-[#7ec850] text-[#7ec850] font-pixel text-[9px] px-3 py-0.5 rounded-full uppercase tracking-wider">
                KARTU KARAKTER PETUALANG
              </div>
              <h2 className="font-pixel text-base sm:text-lg text-[#f0d060] tracking-wide">
                PROFIL MAHASISWA BARU
              </h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Avatar Pickers (Cowok & Cewek from character.jpeg) */}
              <div>
                <label className="block font-pixel text-[10px] text-[#f0d060] mb-2 uppercase">
                  Pilih Karakter Mahasiswa (Cowok / Cewek):
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {AVATAR_OPTIONS.map((av) => {
                    const isSelected = tempAvatar === av.id;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => {
                          setTempAvatar(av.id);
                          if (soundEnabled) soundEngine.playSelect();
                        }}
                        className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-b from-[#3d7828] to-[#255018] border-[#f0d060] shadow-[0_0_15px_rgba(126,200,80,0.45)] scale-[1.02]'
                            : 'bg-[#170f07] border-[#5a3a18] hover:border-[#8b6f4e]'
                        }`}
                      >
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#170f07] border-2 border-[#f0d060] shrink-0 relative shadow-inner">
                          <Image
                            src={av.avatarImage}
                            alt={av.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="text-center w-full">
                          <div className="font-pixel text-[10px] text-white font-bold flex items-center justify-center gap-1">
                            <span>{av.gender === 'pria' ? 'Cowok' : 'Cewek'}</span>
                            {av.gender === 'pria' ? (
                              <GenderMale size={13} weight="bold" className="text-[#60a8d8]" />
                            ) : (
                              <GenderFemale size={13} weight="bold" className="text-[#ff8080]" />
                            )}
                          </div>
                          <div className="font-sans text-[11px] text-[#c4956a] mt-0.5">
                            {av.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-2.5 pt-1">
                <div>
                  <label className="block font-pixel text-[9px] text-[#c4956a] mb-1 uppercase">
                    Nama Lengkap Mahasiswa
                  </label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    required
                    className="w-full bg-[#170f07] border-2 border-[#5a3a18] focus:border-[#f0d060] rounded-md px-3 py-2 text-sm text-white font-sans outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-pixel text-[9px] text-[#c4956a] mb-1 uppercase">
                      NIM (Nomor Induk)
                    </label>
                    <input
                      type="text"
                      value={tempNim}
                      onChange={(e) => setTempNim(e.target.value)}
                      required
                      className="w-full bg-[#170f07] border-2 border-[#5a3a18] focus:border-[#f0d060] rounded-md px-3 py-2 text-xs text-white font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-pixel text-[9px] text-[#c4956a] mb-1 uppercase">
                      Program Studi
                    </label>
                    <input
                      type="text"
                      value={tempProdi}
                      onChange={(e) => setTempProdi(e.target.value)}
                      required
                      className="w-full bg-[#170f07] border-2 border-[#5a3a18] focus:border-[#f0d060] rounded-md px-3 py-2 text-xs text-white font-sans outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 text-xs font-pixel font-bold uppercase rpg-btn-primary"
                >
                  SIMPAN KARAKTER
                </button>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="py-3 px-5 text-xs font-pixel font-bold uppercase rpg-btn-wood"
                >
                  BATAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
