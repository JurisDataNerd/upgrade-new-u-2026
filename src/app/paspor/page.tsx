'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  IdentificationBadge,
  Trophy,
  Sparkle,
  CheckCircle,
  LockKey,
  ArrowRight,
  Printer,
  ArrowCounterClockwise,
} from '@phosphor-icons/react';
import { FLOORS_DATA, BOOTHS_DATA, LEVEL_CONFIG, AVATAR_OPTIONS } from '@/data/mockData';
import { useGameStore } from '@/store/useGameStore';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { PixelProgress } from '@/components/ui/PixelProgress';
import { Navbar } from '@/components/layout/Navbar';
import { CrtScanlines } from '@/components/layout/CrtScanlines';
import { soundEngine } from '@/lib/sound';

export default function PassportPage() {
  const participant = useGameStore((state) => state.participant);
  const getCompletedFloorsCount = useGameStore((state) => state.getCompletedFloorsCount);
  const currentLevel = useGameStore((state) => state.getCurrentLevel());
  const resetProgress = useGameStore((state) => state.resetProgress);
  const soundEnabled = useGameStore((state) => state.soundEnabled);

  const [showCertificate, setShowCertificate] = useState(false);
  const [selectedStampPreview, setSelectedStampPreview] = useState<string | null>(null);

  const completedFloors = getCompletedFloorsCount();
  const currentLevelData = LEVEL_CONFIG.find((l) => l.level === currentLevel) || LEVEL_CONFIG[0];
  const totalStampsCollected = participant.completedBooths.length;
  const isAllCompleted = completedFloors === 9 && totalStampsCollected === 18;

  const selectedAvatarObj =
    AVATAR_OPTIONS.find((a) => a.id === participant.avatar) || AVATAR_OPTIONS[0];

  const handlePrint = () => {
    if (soundEnabled) soundEngine.playClick();
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleResetConfirm = () => {
    if (window.confirm('Apakah kamu yakin ingin mereset semua progres stempel?')) {
      resetProgress();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#2d1b0e] text-[#f0e0c0]">
      <CrtScanlines />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[9px] text-[#7ec850] uppercase tracking-widest">
                DOKUMEN RESMI ORIENTASI
              </span>
              <PixelBadge variant="gold" size="sm">
                VERSI 2026
              </PixelBadge>
            </div>
            <h1 className="font-pixel text-xl sm:text-2xl font-bold text-[#f0d060] mt-1 flex items-center gap-2.5">
              <IdentificationBadge size={28} weight="fill" className="text-[#f0d060]" />
              <span>PASPOR DIGITAL MAHASISWA</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="rpg-btn-wood py-2 px-3 text-xs font-pixel font-bold flex items-center gap-2"
            >
              <Printer size={16} weight="bold" />
              <span>Cetak / Simpan</span>
            </button>
            <button
              onClick={handleResetConfirm}
              className="rpg-btn-danger py-2 px-3 text-xs font-pixel font-bold flex items-center gap-2"
              title="Reset Progres"
            >
              <ArrowCounterClockwise size={16} weight="bold" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Player ID Card & Level HUD (Seeds of Hope ledger layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Identity Booklet Left Page */}
          <div className="lg:col-span-5">
            <div className="h-full sdv-card-gold p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b-2 border-[#5a3a18] pb-3 mb-4">
                  <div className="flex items-center gap-2 font-pixel text-xs text-[#f0d060]">
                    <Sparkle size={16} weight="fill" />
                    <span>KARTU IDENTITAS MAHASISWA</span>
                  </div>
                  <Image
                    src="/unu.png"
                    alt="UNU Logo"
                    width={36}
                    height={36}
                    className="h-6 w-auto object-contain"
                  />
                </div>

                {/* Avatar & Basic Info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-18 h-18 bg-[#170f07] border-2 border-[#f0d060] rounded-xl overflow-hidden shadow-inner shrink-0 relative">
                    <Image
                      src={selectedAvatarObj.avatarImage}
                      alt={selectedAvatarObj.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h2 className="font-pixel text-sm sm:text-base font-bold text-white truncate">
                      {participant.name}
                    </h2>
                    <p className="font-mono text-xs text-[#7ec850]">
                      NIM: {participant.nim}
                    </p>
                    <p className="font-sans text-xs text-[#f0e0c0]">
                      {participant.prodi}
                    </p>
                    <p className="font-sans text-[11px] text-[#a08060]">
                      {participant.faculty}
                    </p>
                  </div>
                </div>

                {/* Level Title & Details */}
                <div className="bg-[#170f07] p-3.5 border-2 border-[#5a3a18] rounded-xl mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-[9px] text-[#a08060] uppercase">
                      Pangkat Karakter:
                    </span>
                    <PixelBadge
                      variant={
                        completedFloors === 9
                          ? 'gold'
                          : completedFloors >= 4
                          ? 'gold'
                          : 'emerald'
                      }
                      size="sm"
                    >
                      {currentLevelData.badgeIcon} {currentLevel}
                    </PixelBadge>
                  </div>
                  <p className="font-sans text-xs text-[#c4956a] leading-relaxed">
                    {currentLevelData.description}
                  </p>
                </div>
              </div>

              {/* Certificate Unlock Banner if completed */}
              {isAllCompleted ? (
                <div className="bg-[#1f3a2b] border-2 border-[#7ec850] rounded-xl p-3.5 shadow-lg text-center space-y-2">
                  <div className="font-pixel text-xs font-bold text-[#f0d060] flex items-center justify-center gap-1.5">
                    <Trophy size={16} weight="fill" className="text-[#f0d060]" />
                    <span>ORIENTASI 100% TUNTAS!</span>
                  </div>
                  <button
                    onClick={() => {
                      if (soundEnabled) soundEngine.playClick();
                      setShowCertificate(true);
                    }}
                    className="w-full rpg-btn-primary py-2.5 px-4 text-xs font-pixel font-bold"
                  >
                    Buka Sertifikat Kelulusan
                  </button>
                </div>
              ) : (
                <div className="bg-[#170f07] p-3 border border-[#5a3a18] rounded-lg text-xs font-sans text-[#a08060] text-center">
                  Selesaikan {9 - completedFloors} lantai lagi untuk membuka predikat{' '}
                  <strong className="text-[#f0d060] font-pixel text-[10px]">UPGRADED YOU</strong> & sertifikat kelulusan.
                </div>
              )}
            </div>
          </div>

          {/* Stats & Progress Overview Right Page */}
          <div className="lg:col-span-7">
            <div className="h-full sdv-card p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-[#5a3a18] pb-3">
                  <div className="font-pixel text-xs text-[#f0d060]">
                    RINGKASAN KOLEKSI STEMPEL
                  </div>
                  <div className="font-pixel text-xs text-[#7ec850]">
                    {totalStampsCollected} / 18 Stempel Terkumpul
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-3">
                  <PixelProgress
                    value={totalStampsCollected}
                    max={18}
                    label="TOTAL STEMPEL DIKOLEKSI"
                    sublabel={`${totalStampsCollected} dari 18 booth`}
                    color="emerald"
                    height="md"
                  />

                  <PixelProgress
                    value={completedFloors}
                    max={9}
                    label="LANTAI TUNTAS (2/2 STEMPEL)"
                    sublabel={`${completedFloors} dari 9 lantai`}
                    color="gold"
                    height="md"
                  />
                </div>

                {/* Level Tier Roadmap */}
                <div className="space-y-2 pt-2">
                  <span className="font-pixel text-[9px] text-[#a08060] uppercase">
                    Tahapan Upgrade Karakter:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {LEVEL_CONFIG.map((lvl) => {
                      const isCurrent = lvl.level === currentLevel;
                      const isPassed =
                        (lvl.level === 'New You' && completedFloors >= 0) ||
                        (lvl.level === 'Explorer' && completedFloors >= 2) ||
                        (lvl.level === 'Achiever' && completedFloors >= 4) ||
                        (lvl.level === 'Almost There' && completedFloors >= 6) ||
                        (lvl.level === 'Upgraded You' && completedFloors >= 9);

                      return (
                        <div
                          key={lvl.level}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                            isCurrent
                              ? 'bg-[#1f3a2b] border-[#7ec850] text-[#f0d060] shadow-sm'
                              : isPassed
                              ? 'bg-[#170f07] border-[#5a3a18] text-[#f0e0c0]'
                              : 'bg-[#170f07]/50 border-[#3d2b1e] text-[#a08060]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-pixel text-[9px]">
                            <span>{lvl.badgeIcon}</span>
                            <span>{lvl.title}</span>
                          </div>
                          <span className="font-sans text-[10px] text-[#a08060]">
                            {lvl.minFloors === lvl.maxFloors
                              ? `${lvl.minFloors} Lt`
                              : `${lvl.minFloors}-${lvl.maxFloors} Lt`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#5a3a18] pt-3 mt-4 flex items-center justify-between">
                <span className="font-pixel text-xs text-[#f0d060]">
                  Total XP: {participant.totalXp} PTS
                </span>
                <Link href="/peta">
                  <button
                    onClick={() => soundEnabled && soundEngine.playClick()}
                    className="rpg-btn-primary py-2.5 px-4 text-xs font-pixel font-bold flex items-center gap-2"
                  >
                    <span>Buka Peta Gedung</span>
                    <ArrowRight size={14} weight="bold" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 18-Stamp Digital Grid (9 Floors x 2 Booths) */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-pixel text-sm sm:text-base font-bold text-[#f0d060] flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#7ec850] rounded-full animate-pulse" />
              KOLEKSI 18 STEMPEL RESMI (9 LANTAI × 2 BOOTH)
            </h3>
            <span className="text-xs font-pixel text-[#a08060]">
              KLIK STEMPEL UNTUK DETAIL
            </span>
          </div>

          {/* 9 Floors Stamp Rows */}
          <div className="space-y-3.5">
            {FLOORS_DATA.map((floor) => {
              const boothA = BOOTHS_DATA[floor.boothIds[0]];
              const boothB = BOOTHS_DATA[floor.boothIds[1]];

              const stampA = participant.stamps[boothA.id];
              const stampB = participant.stamps[boothB.id];

              const isFloorComplete = Boolean(stampA && stampB);

              return (
                <div
                  key={floor.number}
                  className={`sdv-card p-4 sm:p-5 ${
                    isFloorComplete ? 'border-[#7ec850] bg-[#1e3321]' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#5a3a18] pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-xs font-bold text-[#7ec850]">
                        LANTAI {floor.number}:
                      </span>
                      <span className="font-pixel text-xs text-white">
                        {floor.name.split(' - ')[1] || floor.name}
                      </span>
                    </div>
                    {isFloorComplete ? (
                      <PixelBadge variant="emerald" size="sm">
                        <CheckCircle size={12} weight="bold" /> 2/2 STEMPEL LENGKAP
                      </PixelBadge>
                    ) : (
                      <span className="font-sans text-xs text-[#a08060]">
                        {stampA && !stampB ? '1/2 Stempel' : !stampA && stampB ? '1/2 Stempel' : '0/2 Stempel'}
                      </span>
                    )}
                  </div>

                  {/* 2 Stamps Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Stamp A */}
                    <StampSlot
                      booth={boothA}
                      stampRecord={stampA}
                      onClick={() => {
                        if (soundEnabled) soundEngine.playSelect();
                        setSelectedStampPreview(boothA.id);
                      }}
                    />

                    {/* Stamp B */}
                    <StampSlot
                      booth={boothB}
                      stampRecord={stampB}
                      onClick={() => {
                        if (soundEnabled) soundEngine.playSelect();
                        setSelectedStampPreview(boothB.id);
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Stamp Detail Modal */}
      {selectedStampPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0604]/85 backdrop-blur-md animate-in fade-in duration-150">
          {(() => {
            const b = BOOTHS_DATA[selectedStampPreview];
            const s = participant.stamps[selectedStampPreview];

            return (
              <div className="w-full max-w-md sdv-card-gold p-6 text-center relative">
                {/* Stamp Seal Graphic */}
                <div className="my-4 flex justify-center">
                  <div
                    className={`w-28 h-28 border-3 rounded-xl flex flex-col items-center justify-center p-2 rotate-[-2deg] ${
                      s
                        ? 'border-[#f0d060] bg-gradient-to-b from-[#3d7828] to-[#255018] shadow-[0_0_15px_rgba(126,200,80,0.4)]'
                        : 'border-[#5a3a18] bg-[#170f07] filter grayscale opacity-40'
                    }`}
                  >
                    <span className="text-3xl select-none">{b.stampIcon}</span>
                    <span className="font-pixel text-[8px] text-[#f0d060] font-bold uppercase mt-1">
                      {b.stampTitle}
                    </span>
                    <span className="font-mono text-[7px] text-[#e0f0d0] mt-0.5">
                      LANTAI {b.floorNumber} • {b.code}
                    </span>
                  </div>
                </div>

                <h3 className="font-pixel text-sm font-bold text-white mb-1">
                  {b.name}
                </h3>
                <p className="font-sans text-xs text-[#c4956a] mb-4 leading-relaxed">
                  {b.story}
                </p>

                {s ? (
                  <div className="bg-[#170f07] p-3 border border-[#4a8030] rounded-lg mb-4 space-y-1 text-xs">
                    <div className="text-[#7ec850] font-pixel text-[9px]">
                      STATUS: RESMI DISTEMPEL
                    </div>
                    <div className="text-[#f0e0c0] font-sans">
                      Tanggal Perolehan: {s.earnedAt}
                    </div>
                    <div className="text-[#f0d060] font-sans">
                      Skor Kuis: {s.score}/{s.totalQuestions} Benar
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#170f07] p-3 border border-[#5a3a18] rounded-lg mb-4 space-y-1 text-xs">
                    <div className="text-[#a08060] font-pixel text-[9px]">
                      STATUS: BELUM DISTEMPEL
                    </div>
                    <p className="text-[#c4956a] font-sans text-[11px]">
                      Kunjungi booth ini di Lantai {b.floorNumber} untuk mengerjakan kuis dan membuka stempel.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link href={`/booth/${b.id}`} className="w-full">
                    <button
                      onClick={() => soundEnabled && soundEngine.playClick()}
                      className="rpg-btn-primary py-3 px-4 text-xs font-pixel font-bold w-full"
                    >
                      {s ? 'Buka Ulang Booth' : 'Kunjungi Booth Sekarang'}
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      if (soundEnabled) soundEngine.playClick();
                      setSelectedStampPreview(null);
                    }}
                    className="rpg-btn-wood py-3 px-4 text-xs font-pixel font-bold w-full"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Graduation Certificate Modal with UNU Logo */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0604]/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-gradient-to-b from-[#2d1b0e] to-[#170f07] border-[4px] border-[#f0d060] rounded-2xl p-6 sm:p-8 text-center relative shadow-2xl">
            <div className="border-2 border-[#8b6f4e] rounded-xl p-6 sm:p-8 bg-[#170f07]/90 space-y-4 shadow-inner">
              <div className="flex items-center justify-center gap-3">
                <Image
                  src="/unu.png"
                  alt="UNU Logo"
                  width={56}
                  height={56}
                  className="h-12 w-auto object-contain"
                />
              </div>

              <div className="font-pixel text-[10px] sm:text-xs text-[#7ec850] tracking-widest uppercase">
                UNIVERSITAS NAHDLATUL ULAMA YOGYAKARTA
              </div>

              <h2 className="font-pixel text-lg sm:text-2xl font-extrabold text-[#f0d060]">
                SERTIFIKAT KELULUSAN GENIUS
              </h2>

              <p className="font-sans text-xs text-[#c4956a]">
                Dengan bangga menyatakan bahwa:
              </p>

              <div className="text-lg sm:text-xl font-pixel font-bold text-white border-b-2 border-dashed border-[#f0d060] pb-2 max-w-md mx-auto">
                {participant.name}
              </div>

              <div className="font-mono text-xs text-[#7ec850]">
                NIM: {participant.nim} • {participant.prodi}
              </div>

              <p className="font-sans text-xs sm:text-sm text-[#f0e6d2] max-w-lg mx-auto leading-relaxed">
                Telah berhasil menyelesaikan eksplorasi <strong className="text-[#f0d060]">9 Lantai Gedung Kampus</strong>,
                mengoleksi seluruh <strong className="text-[#7ec850]">18 Stempel Karakter</strong>, dan resmi dinobatkan sebagai:
              </p>

              <div className="inline-block bg-gradient-to-r from-[#3d7828] to-[#255018] text-[#f0d060] font-pixel text-sm sm:text-base font-black px-6 py-2.5 rounded-lg border-2 border-[#f0d060] shadow-lg">
                ★ THE UPGRADED YOU ★
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handlePrint}
                  className="rpg-btn-primary py-3 px-6 text-xs font-pixel font-bold flex items-center justify-center gap-2"
                >
                  <Printer size={18} weight="bold" />
                  <span>Cetak Sertifikat</span>
                </button>
                <button
                  onClick={() => {
                    if (soundEnabled) soundEngine.playClick();
                    setShowCertificate(false);
                  }}
                  className="rpg-btn-wood py-3 px-6 text-xs font-pixel font-bold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StampSlotProps {
  booth: {
    id: string;
    code: string;
    name: string;
    subtitle: string;
    stampIcon: string;
    stampTitle: string;
    stampColor: string;
    badgeTag: string;
    floorNumber: number;
  };
  stampRecord?: {
    earnedAt: string;
    score: number;
    totalQuestions: number;
  };
  onClick: () => void;
}

const StampSlot: React.FC<StampSlotProps> = ({ booth, stampRecord, onClick }) => {
  const isAcquired = Boolean(stampRecord);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer ${
        isAcquired
          ? 'bg-[#1a2e1a] border-[#7ec850] shadow-[0_2px_8px_rgba(0,0,0,0.4)] hover:border-[#f0d060]'
          : 'bg-[#170f07]/70 border-dashed border-[#5a3a18] hover:border-[#8b6f4e] opacity-70'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center shrink-0 ${
            isAcquired
              ? 'border-[#f0d060] bg-gradient-to-b from-[#3d7828] to-[#255018] text-2xl shadow-inner'
              : 'border-[#5a3a18] bg-[#23160c] text-[#5a3a18] text-lg filter grayscale'
          }`}
        >
          {isAcquired ? (
            <span>{booth.stampIcon}</span>
          ) : (
            <LockKey size={20} weight="bold" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-pixel text-[9px] bg-[#170f07] px-1.5 py-0.5 rounded text-[#f0d060] border border-[#5a3a18]">
              {booth.code}
            </span>
            <span className="font-sans text-[11px] text-[#c4956a] truncate">
              {booth.badgeTag}
            </span>
          </div>
          <h4
            className={`font-pixel text-xs truncate ${
              isAcquired ? 'text-white font-bold' : 'text-[#a08060]'
            }`}
          >
            {booth.name}
          </h4>
          <p className="font-mono text-[10px] text-[#a08060] mt-0.5 truncate">
            {isAcquired ? `Distempel: ${stampRecord?.earnedAt}` : 'Terkunci • Kerjakan Kuis'}
          </p>
        </div>
      </div>

      <div className="shrink-0">
        {isAcquired ? (
          <CheckCircle size={20} weight="fill" className="text-[#7ec850]" />
        ) : (
          <span className="font-pixel text-[9px] text-[#f0d060] bg-[#2d1b0e] px-2 py-1 rounded border border-[#5a3a18]">
            BUKA
          </span>
        )}
      </div>
    </button>
  );
};
