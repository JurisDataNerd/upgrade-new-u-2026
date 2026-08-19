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
  Crown,
  Trophy,
} from '@phosphor-icons/react';
import { useGameStore } from '@/store/useGameStore';
import { AVATAR_OPTIONS, UNU_FACULTIES } from '@/data/mockData';
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
  const [tempFaculty, setTempFaculty] = useState(
    participant.faculty || UNU_FACULTIES[1].name
  );
  const [tempProdi, setTempProdi] = useState(
    participant.prodi || 'Informatika'
  );
  const [tempAvatar, setTempAvatar] = useState(participant.avatar);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setParticipantInfo({
      name: tempName,
      nim: tempNim,
      faculty: tempFaculty,
      prodi: tempProdi,
      avatar: tempAvatar,
    });
    if (soundEnabled) soundEngine.playCorrect();
    setIsProfileModalOpen(false);
  };

  const handleFacultyChange = (newFac: string) => {
    setTempFaculty(newFac);
    const facObj = UNU_FACULTIES.find((f) => f.name === newFac);
    if (facObj && facObj.prodi.length > 0) {
      setTempProdi(facObj.prodi[0]);
    }
  };

  const handleSelectQuickAvatar = (avatarId: string) => {
    setTempAvatar(avatarId);
    setParticipantInfo({ avatar: avatarId });
    if (soundEnabled) soundEngine.playSelect();
  };

  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between overflow-hidden select-none">
      {/* Background Image: Bright & Clearly Visible UNU Campus 9 Floors Building */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/unu-hero.jpeg"
          alt="Gedung Kampus UNU Yogyakarta 9 Lantai"
          fill
          priority
          className="object-cover object-center filter brightness-[0.88] contrast-[1.05] saturate-[1.05] animate-ken-burns"
        />
        {/* Soft, translucent warm gradient overlay so building stays clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#120b06]/75 via-transparent to-[#160d07]/90 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(18,11,6,0.4)_100%)] pointer-events-none" />
      </div>

      {/* Top Bar: Institutional Logo & Audio Controls */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-3 sm:px-6 pt-2 sm:pt-4 flex items-center justify-between gap-2 shrink-0">
        {/* Partner / Institution Badge */}
        <div className="backdrop-blur-md bg-[#140e0a]/85 border border-[#f0d060]/50 rounded-full px-3 sm:px-5 py-1 sm:py-1.5 flex items-center gap-2 sm:gap-3 shadow-lg">
          <Image
            src="/unu.png"
            alt="Logo UNU Yogyakarta"
            width={90}
            height={32}
            priority
            className="h-6 sm:h-8 w-auto object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          />
          <div className="w-[1px] h-4 sm:h-6 bg-[#f0d060]/40" />
          <div className="flex flex-col text-left leading-none">
            <span className="font-pixel text-[8px] sm:text-[10px] text-[#f0d060] font-bold tracking-wider">
              UNU YOGYAKARTA
            </span>
            <span className="font-sans text-[8px] sm:text-[11px] text-[#a0d870] font-medium pt-0.5">
              Orientasi Mahasiswa Baru
            </span>
          </div>
        </div>

        {/* Top Right Quick Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Matikan Suara 8-Bit' : 'Nyalakan Suara 8-Bit'}
            className="p-1.5 sm:p-2 bg-[#2d1b0e]/90 border border-[#8b6f4e] hover:border-[#f0d060] rounded-lg text-[#f0d060] transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {soundEnabled ? (
              <SpeakerHigh size={16} weight="bold" />
            ) : (
              <SpeakerSimpleSlash size={16} weight="bold" />
            )}
          </button>

          <button
            onClick={toggleCrt}
            title={crtEffect ? 'Matikan Layar CRT' : 'Nyalakan Layar CRT'}
            className="p-1.5 sm:p-2 bg-[#2d1b0e]/90 border border-[#8b6f4e] hover:border-[#f0d060] rounded-lg text-[#f0d060] transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Television size={16} weight="bold" />
          </button>

          <Link href="/bantuan" className="inline-block">
            <button
              onClick={() => soundEnabled && soundEngine.playClick()}
              className="p-1.5 sm:p-2 bg-[#2d1b0e]/90 border border-[#8b6f4e] hover:border-[#f0d060] rounded-lg text-[#f0d060] transition-all shadow-md active:scale-95 cursor-pointer"
              title="Panduan Petualang"
            >
              <Info size={16} weight="bold" />
            </button>
          </Link>
        </div>
      </div>

      {/* Main Menu Center Content (Seeds of Hope Layout - Compact Fit to Screen) */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-3 sm:px-6 my-auto flex flex-col items-center justify-center text-center">
        {/* Top Announcement Badge */}
        <div className="mb-1.5 sm:mb-2 inline-block">
          <div className="backdrop-blur-md bg-[#14230f]/90 border border-[#7ec850] text-[#7ec850] font-pixel text-[8px] sm:text-[10px] px-3 py-1 rounded-full tracking-widest uppercase shadow-md flex items-center gap-1.5">
            <Sparkle size={12} weight="fill" className="text-[#f0d060] animate-spin" />
            <span>ORIENTASI MAHASISWA BARU 2026</span>
          </div>
        </div>

        {/* Grand Title */}
        <div className="space-y-0.5 sm:space-y-1 mb-2.5 sm:mb-4">
          <h1
            className="font-pixel text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#f0d060] tracking-[4px] sm:tracking-[10px] animate-title-pulse drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)]"
            style={{
              textShadow:
                '2px 2px 0 #6b4f2e, 4px 4px 0 #1b120a, 0 0 20px rgba(240, 208, 96, 0.4)',
            }}
          >
            GENIUS
          </h1>
          <div
            className="font-pixel text-xs sm:text-xl md:text-2xl text-white tracking-[2px] sm:tracking-[4px]"
            style={{
              textShadow: '1px 1px 0 #2d1b0e, 0 2px 8px rgba(0,0,0,0.9)',
            }}
          >
            UPGRADE NEW YOU
          </div>
          <p
            className="font-pixel text-[8px] sm:text-[10px] text-[#a0d870] tracking-[1px] pt-0.5"
            style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9)' }}
          >
            EKSPLORASI GEDUNG 9 LANTAI • 18 CORNER KARAKTER
          </p>
        </div>

        {/* Character Quick-Select Bar */}
        <div className="backdrop-blur-md bg-[#19120c]/90 border border-[#8b6f4e] rounded-xl p-2 mb-2.5 sm:mb-3 max-w-sm w-full shadow-md">
          <div className="flex items-center justify-between gap-2 px-1 mb-1.5">
            <span className="font-pixel text-[8px] text-[#f0d060] uppercase">
              Karakter Utama:
            </span>
            <button
              onClick={() => {
                if (soundEnabled) soundEngine.playClick();
                setIsProfileModalOpen(true);
              }}
              className="text-[9px] font-sans text-[#c4956a] hover:text-[#f0d060] underline cursor-pointer"
            >
              Ubah Data Diri
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {AVATAR_OPTIONS.map((av) => {
              const isSelected = participant.avatar === av.id;
              return (
                <button
                  key={av.id}
                  onClick={() => handleSelectQuickAvatar(av.id)}
                  className={`p-1.5 rounded-lg border text-left transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#3d7828] to-[#255018] border-[#f0d060] shadow-[0_0_10px_rgba(126,200,80,0.4)]'
                      : 'bg-[#170f07]/80 border-[#5a3a18] hover:border-[#8b6f4e]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-md overflow-hidden bg-[#170f07] border border-[#f0d060] shrink-0 relative">
                    <Image
                      src={av.avatarImage}
                      alt={av.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-pixel text-[8px] text-white font-bold flex items-center gap-1">
                      <span>{av.gender === 'pria' ? 'Cowok' : 'Cewek'}</span>
                      {av.gender === 'pria' ? (
                        <GenderMale size={10} weight="bold" className="text-[#60a8d8]" />
                      ) : (
                        <GenderFemale size={10} weight="bold" className="text-[#ff8080]" />
                      )}
                    </div>
                    <div className="font-sans text-[9px] text-[#c4956a]">
                      {av.gender === 'pria' ? 'Peci & Jas' : 'Hijab & Jas'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Action Buttons Stack */}
        <div className="w-full max-w-sm flex flex-col items-center gap-2">
          {/* Primary Action Button */}
          <Link href="/play" className="w-full">
            <button
              onClick={() => soundEnabled && soundEngine.playClick()}
              className="w-full py-2.5 sm:py-3.5 px-4 text-xs sm:text-sm font-pixel font-bold uppercase tracking-wider rpg-btn-primary flex items-center justify-center gap-2 shadow-lg"
            >
              <GameController size={18} weight="bold" />
              <span>{totalStamps > 0 ? 'LANJUTKAN PENJELAJAHAN' : 'MULAI PERJALANAN'}</span>
            </button>
          </Link>

          {/* Secondary 2 Buttons in 1 Row */}
          <div className="grid grid-cols-2 gap-2 w-full">
            {/* Paspor Digital Button */}
            <Link href="/paspor" className="w-full">
              <button
                onClick={() => soundEnabled && soundEngine.playClick()}
                className="w-full py-2 sm:py-2.5 px-2 text-[10px] sm:text-xs font-pixel font-bold uppercase tracking-wider rpg-btn-wood flex items-center justify-center gap-1.5 shadow"
              >
                <IdentificationBadge size={16} weight="bold" />
                <span>PASPOR ({totalStamps}/18)</span>
              </button>
            </Link>

            {/* Leaderboard Button */}
            <Link href="/leaderboard" className="w-full">
              <button
                onClick={() => soundEnabled && soundEngine.playClick()}
                className="w-full py-2 sm:py-2.5 px-2 text-[10px] sm:text-xs font-pixel font-bold uppercase tracking-wider bg-[#2d1b0e]/90 border-2 border-[#5a3a18] rounded-lg text-[#f0d060] hover:border-[#f0d060] flex items-center justify-center gap-1.5 shadow"
              >
                <Trophy size={15} weight="fill" />
                <span>PERINGKAT</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Footer & Campus Stats Card (Compact Fit-to-screen) */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-3 sm:px-6 pb-2 sm:pb-3 shrink-0">
        <div className="backdrop-blur-md bg-[#19120c]/90 border border-[#8b6f4e] rounded-xl p-2 sm:p-2.5 text-center shadow-lg space-y-1">
          {/* Badges Row */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 font-sans text-[10px] sm:text-xs">
            <div className="bg-[#281e14] border border-[#d4a57a] rounded-full px-2.5 py-0.5 text-white flex items-center gap-1">
              <Buildings size={12} weight="fill" className="text-[#7ec850]" />
              <span><strong>9 Lantai</strong></span>
            </div>

            <div className="bg-[#281e14] border border-[#d4a57a] rounded-full px-2.5 py-0.5 text-white flex items-center gap-1">
              <Sparkle size={12} weight="fill" className="text-[#f0d060]" />
              <span><strong>18 Corner</strong></span>
            </div>

            <div className="bg-[#281e14] border border-[#d4a57a] rounded-full px-2.5 py-0.5 text-white flex items-center gap-1">
              <Crown size={12} weight="fill" className="text-[#f0d060]" />
              <span>Level: <strong className="text-[#f0d060]">{currentLevel}</strong></span>
            </div>

            <div className="bg-[#281e14] border border-[#d4a57a] rounded-full px-2.5 py-0.5 text-white flex items-center gap-1">
              <CheckCircle size={12} weight="fill" className="text-[#7ec850]" />
              <span>{completedFloors}/9 Tuntas</span>
            </div>
          </div>

          <div className="font-pixel text-[7px] sm:text-[8px] text-[#8b6f4e] uppercase tracking-wider">
            UNU YOGYAKARTA © 2026 • GENIUS PROTOTYPE
          </div>
        </div>
      </div>

      {/* Character Selector & Profile RPG Dialogue Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a0604]/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md max-h-[92dvh] overflow-y-auto bg-gradient-to-b from-[#2d1b0e] to-[#1a1008] border-[3px] border-[#f0d060] rounded-2xl p-4 sm:p-6 shadow-[inset_0_0_0_2px_#6b4f2e,0_16px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(240,208,96,0.25)] relative">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-3 right-3 text-[#f0d060] hover:text-white bg-[#3d2b1e] border border-[#8b6f4e] hover:border-[#f0d060] rounded-md w-7 h-7 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer font-pixel text-xs"
            >
              <X size={14} weight="bold" />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-1 mb-3">
              <div className="inline-block bg-[#14230f] border border-[#7ec850] text-[#7ec850] font-pixel text-[8px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                KARTU KARAKTER PETUALANG
              </div>
              <h2 className="font-pixel text-xs sm:text-sm text-[#f0d060] tracking-wide">
                PROFIL MAHASISWA BARU
              </h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              {/* Avatar Pickers */}
              <div>
                <label className="block font-pixel text-[9px] text-[#f0d060] mb-1.5 uppercase">
                  Pilih Karakter (Cowok / Cewek):
                </label>
                <div className="grid grid-cols-2 gap-2">
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
                        className={`p-2 rounded-xl border-2 text-left transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-b from-[#3d7828] to-[#255018] border-[#f0d060] shadow-[0_0_12px_rgba(126,200,80,0.4)] scale-[1.01]'
                            : 'bg-[#170f07] border-[#5a3a18] hover:border-[#8b6f4e]'
                        }`}
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-[#170f07] border border-[#f0d060] shrink-0 relative shadow-inner">
                          <Image
                            src={av.avatarImage}
                            alt={av.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="text-center w-full">
                          <div className="font-pixel text-[9px] text-white font-bold flex items-center justify-center gap-1">
                            <span>{av.gender === 'pria' ? 'Cowok' : 'Cewek'}</span>
                            {av.gender === 'pria' ? (
                              <GenderMale size={11} weight="bold" className="text-[#60a8d8]" />
                            ) : (
                              <GenderFemale size={11} weight="bold" className="text-[#ff8080]" />
                            )}
                          </div>
                          <div className="font-sans text-[9px] text-[#c4956a]">
                            {av.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-2">
                <div>
                  <label className="block font-pixel text-[8px] text-[#c4956a] mb-0.5 uppercase">
                    Nama Lengkap Mahasiswa
                  </label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    required
                    className="w-full bg-[#170f07] border border-[#5a3a18] focus:border-[#f0d060] rounded-md px-2.5 py-1.5 text-xs text-white font-sans outline-none"
                  />
                </div>

                <div>
                  <label className="block font-pixel text-[8px] text-[#c4956a] mb-0.5 uppercase">
                    NIM (Format: 26111xx)
                  </label>
                  <input
                    type="text"
                    value={tempNim}
                    onChange={(e) => setTempNim(e.target.value)}
                    required
                    placeholder="2611101"
                    className="w-full bg-[#170f07] border border-[#5a3a18] focus:border-[#f0d060] rounded-md px-2.5 py-1.5 text-xs text-white font-mono outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-pixel text-[8px] text-[#c4956a] mb-0.5 uppercase">
                      Fakultas
                    </label>
                    <select
                      value={tempFaculty}
                      onChange={(e) => handleFacultyChange(e.target.value)}
                      className="w-full bg-[#170f07] border border-[#5a3a18] focus:border-[#f0d060] rounded-md px-2 py-1.5 text-[11px] text-white outline-none"
                    >
                      {UNU_FACULTIES.map((fac) => (
                        <option key={fac.name} value={fac.name}>
                          {fac.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-pixel text-[8px] text-[#c4956a] mb-0.5 uppercase">
                      Program Studi
                    </label>
                    <select
                      value={tempProdi}
                      onChange={(e) => setTempProdi(e.target.value)}
                      className="w-full bg-[#170f07] border border-[#5a3a18] focus:border-[#f0d060] rounded-md px-2 py-1.5 text-[11px] text-white outline-none"
                    >
                      {(
                        UNU_FACULTIES.find((f) => f.name === tempFaculty)?.prodi || []
                      ).map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 text-xs font-pixel font-bold uppercase rpg-btn-primary"
                >
                  SIMPAN KARAKTER
                </button>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="py-2.5 px-4 text-xs font-pixel font-bold uppercase rpg-btn-wood"
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
