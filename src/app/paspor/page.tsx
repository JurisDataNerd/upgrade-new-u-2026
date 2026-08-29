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
import { StampIcon } from '@/components/ui/StampIcon';
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
      // Passport print: make sure certificate mode is off.
      document.body.classList.remove('print-certificate');
      window.print();
    }
  };

  const handlePrintCertificate = () => {
    if (soundEnabled) soundEngine.playClick();
    if (typeof window !== 'undefined') {
      // Certificate print: isolate the certificate card via body class
      // (see the @media print rules in globals.css).
      document.body.classList.add('print-certificate');
      const clearMode = () => {
        document.body.classList.remove('print-certificate');
        window.removeEventListener('afterprint', clearMode);
      };
      window.addEventListener('afterprint', clearMode);
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

      <main className="print-area max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-pixel text-xl sm:text-2xl font-bold text-[#f0d060] flex items-center gap-2.5">
              <IdentificationBadge size={28} weight="fill" className="text-[#f0d060]" />
              <span>Paspor Mahasiswa</span>
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#c4956a] mt-0.5">
              Catatan perolehan stempel dan progres orientasi kampus.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="rpg-btn-wood py-2 px-3 text-xs font-pixel font-bold flex items-center gap-2"
            >
              <Printer size={16} weight="bold" />
              <span>Cetak</span>
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

        {/* Player ID Card & Level HUD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Identity Card */}
          <div className="lg:col-span-5">
            <div className="h-full sdv-card-gold p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b-2 border-[#5a3a18] pb-3 mb-4">
                  <div className="flex items-center gap-2 font-pixel text-xs text-[#f0d060]">
                    <Sparkle size={16} weight="fill" />
                    <span>Kartu Mahasiswa</span>
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
                  <div className="w-16 h-16 bg-[#170f07] border-2 border-[#f0d060] rounded-xl overflow-hidden shadow-inner shrink-0 relative">
                    <Image
                      src={selectedAvatarObj.avatarImage}
                      alt={selectedAvatarObj.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 space-y-1 flex-1">
                    <h2 className="font-pixel text-sm sm:text-base font-bold text-white leading-snug break-words">
                      {participant.name}
                    </h2>
                    <p className="font-mono text-xs text-[#7ec850]">
                      NIM: {participant.nim}
                    </p>
                    <p className="font-sans text-xs text-[#f0e0c0] leading-tight break-words">
                      {participant.prodi}
                    </p>
                    <p className="font-sans text-[11px] text-[#a08060] leading-tight break-words">
                      {participant.faculty}
                    </p>
                  </div>
                </div>

                {/* Level Title & Details */}
                <div className="bg-[#170f07] p-3 border-2 border-[#5a3a18] rounded-xl mb-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-[9px] text-[#a08060] uppercase">
                      Pangkat:
                    </span>
                    <PixelBadge
                      variant={completedFloors === 9 ? 'gold' : 'emerald'}
                      size="sm"
                    >
                      {currentLevel}
                    </PixelBadge>
                  </div>
                  <p className="font-sans text-xs text-[#c4956a] leading-relaxed">
                    {currentLevelData.description}
                  </p>
                </div>
              </div>

              {/* Certificate Unlock Banner if completed */}
              {isAllCompleted ? (
                <div className="bg-[#1f3a2b] border-2 border-[#7ec850] rounded-xl p-3 shadow text-center space-y-2">
                  <div className="font-pixel text-xs font-bold text-[#f0d060] flex items-center justify-center gap-1.5">
                    <Trophy size={16} weight="fill" className="text-[#f0d060]" />
                    <span>Semua Lantai Selesai!</span>
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
                <div className="bg-[#170f07] p-2.5 border border-[#5a3a18] rounded-lg text-xs font-sans text-[#a08060] text-center">
                  Selesaikan {9 - completedFloors} lantai lagi untuk membuka sertifikat kelulusan.
                </div>
              )}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="lg:col-span-7">
            <div className="h-full sdv-card p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-[#5a3a18] pb-3">
                  <div className="font-pixel text-xs text-[#f0d060]">
                    Koleksi Stempel
                  </div>
                  <div className="font-pixel text-xs text-[#7ec850]">
                    {totalStampsCollected} / 18 Stempel
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-3">
                  <PixelProgress
                    value={totalStampsCollected}
                    max={18}
                    label="TOTAL STEMPEL"
                    sublabel={`${totalStampsCollected} dari 18`}
                    color="emerald"
                    height="md"
                  />

                  <PixelProgress
                    value={completedFloors}
                    max={9}
                    label="LANTAI SELESAI"
                    sublabel={`${completedFloors} dari 9`}
                    color="gold"
                    height="md"
                  />
                </div>
              </div>

              <div className="border-t border-[#5a3a18] pt-3 mt-4 flex items-center justify-between">
                <span className="font-pixel text-xs text-[#f0d060]">
                  Total: {participant.totalXp} XP
                </span>
                <Link href="/play">
                  <button
                    onClick={() => soundEnabled && soundEngine.playClick()}
                    className="rpg-btn-primary py-2.5 px-4 text-xs font-pixel font-bold flex items-center gap-2"
                  >
                    <span>Mulai Main</span>
                    <ArrowRight size={14} weight="bold" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 18-Stamp Grid (9 Floors x 2 Booths) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-pixel text-xs sm:text-sm font-bold text-[#f0d060]">
              DAFTAR 18 STEMPEL (9 LANTAI)
            </h3>
            <span className="text-[10px] font-pixel text-[#a08060]">
              KLIK UNTUK DETAIL
            </span>
          </div>

          <div className="space-y-3">
            {FLOORS_DATA.map((floor) => {
              const boothA = BOOTHS_DATA[floor.boothIds[0]];
              const boothB = BOOTHS_DATA[floor.boothIds[1]];

              const stampA = participant.stamps[boothA.id];
              const stampB = participant.stamps[boothB.id];

              const isFloorComplete = Boolean(stampA && stampB);

              return (
                <div
                  key={floor.number}
                  className={`sdv-card p-3.5 sm:p-4 ${
                    isFloorComplete ? 'border-[#7ec850] bg-[#1e3321]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-[#5a3a18] pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-xs font-bold text-[#7ec850]">
                        Lantai {floor.number}:
                      </span>
                      <span className="font-pixel text-xs text-white">
                        {floor.name.split(' - ')[1] || floor.name}
                      </span>
                    </div>
                    {isFloorComplete ? (
                      <PixelBadge variant="emerald" size="sm">
                        <CheckCircle size={12} weight="bold" /> 2/2 Selesai
                      </PixelBadge>
                    ) : (
                      <span className="font-sans text-xs text-[#a08060]">
                        {stampA || stampB ? '1/2' : '0/2'}
                      </span>
                    )}
                  </div>

                  {/* 2 Stamps Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <StampSlot
                      booth={boothA}
                      stampRecord={stampA}
                      onClick={() => {
                        if (soundEnabled) soundEngine.playSelect();
                        setSelectedStampPreview(boothA.id);
                      }}
                    />

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
              <div className="w-full max-w-md sdv-card-gold p-5 sm:p-6 text-center relative">
                {/* Stamp Graphic */}
                <div className="my-3 flex justify-center">
                  <div
                    className={`w-24 h-24 border-3 rounded-xl flex flex-col items-center justify-center p-2 rotate-[-2deg] ${
                      s
                        ? 'border-[#f0d060] bg-gradient-to-b from-[#3d7828] to-[#255018] shadow'
                        : 'border-[#5a3a18] bg-[#170f07] opacity-40'
                    }`}
                  >
                    <StampIcon
                      name={b.stampIcon}
                      size={28}
                      className={s ? 'text-[#f0d060]' : 'text-[#8b6f4e]'}
                    />
                    <span className="font-pixel text-[8px] text-[#f0d060] font-bold uppercase mt-1">
                      {b.stampTitle}
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
                  <div className="bg-[#170f07] p-2.5 border border-[#4a8030] rounded-lg mb-4 space-y-1 text-xs">
                    <div className="text-[#7ec850] font-pixel text-[9px]">
                      STATUS: RESMI DISTEMPEL
                    </div>
                    <div className="text-[#f0d060] font-sans">
                      Skor: {s.score}/{s.totalQuestions} Benar
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#170f07] p-2.5 border border-[#5a3a18] rounded-lg mb-4 text-xs font-sans text-[#a08060]">
                    Kunjungi spot ini di Lantai {b.floorNumber} untuk menyelesaikan tantangan.
                  </div>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/play/floor/${b.floorNumber}/spot/${b.id}`}
                    className="w-full"
                  >
                    <button
                      onClick={() => soundEnabled && soundEngine.playClick()}
                      className="rpg-btn-primary py-2.5 px-4 text-xs font-pixel font-bold w-full"
                    >
                      {s ? 'Main Ulang' : 'Mainkan'}
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      if (soundEnabled) soundEngine.playClick();
                      setSelectedStampPreview(null);
                    }}
                    className="rpg-btn-wood py-2.5 px-4 text-xs font-pixel font-bold w-full"
                  >
                    Kembali
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Graduation Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0604]/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="print-area print-certificate w-full max-w-2xl bg-gradient-to-b from-[#2d1b0e] to-[#170f07] border-[4px] border-[#f0d060] rounded-2xl p-6 sm:p-8 text-center relative shadow-2xl">
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

              <h2 className="font-pixel text-lg sm:text-2xl font-bold text-[#f0d060]">
                SERTIFIKAT KELULUSAN ORIENTASI
              </h2>

              <p className="font-sans text-xs text-[#c4956a]">
                Menyatakan bahwa:
              </p>

              <div className="text-lg sm:text-xl font-pixel font-bold text-white border-b-2 border-dashed border-[#f0d060] pb-2 max-w-md mx-auto">
                {participant.name}
              </div>

              <div className="font-mono text-xs text-[#7ec850]">
                NIM: {participant.nim} • {participant.prodi}
              </div>

              <p className="font-sans text-xs sm:text-sm text-[#f0e6d2] max-w-lg mx-auto leading-relaxed">
                Telah berhasil menyelesaikan eksplorasi 9 lantai dan mengumpulkan seluruh 18 stempel orientasi.
              </p>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handlePrintCertificate}
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
                  Kembali
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
      className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer ${
        isAcquired
          ? 'bg-[#1a2e1a] border-[#7ec850] shadow hover:border-[#f0d060]'
          : 'bg-[#170f07]/70 border-dashed border-[#5a3a18] hover:border-[#8b6f4e] opacity-70'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-10 h-10 rounded-lg border-2 flex flex-col items-center justify-center shrink-0 ${
            isAcquired
              ? 'border-[#f0d060] bg-gradient-to-b from-[#3d7828] to-[#255018]'
              : 'border-[#5a3a18] bg-[#23160c] text-[#5a3a18]'
          }`}
        >
          {isAcquired ? (
            <StampIcon name={booth.stampIcon} size={20} className="text-[#f0d060]" />
          ) : (
            <LockKey size={18} weight="bold" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span className="font-pixel text-[9px] bg-[#170f07] px-1.5 py-0.5 rounded text-[#f0d060] border border-[#5a3a18]">
              {booth.code}
            </span>
            <span className="font-sans text-[11px] text-[#c4956a] leading-tight">
              {booth.badgeTag}
            </span>
          </div>
          <h4
            className={`font-pixel text-[9px] sm:text-[10px] leading-normal break-words ${
              isAcquired ? 'text-white font-bold' : 'text-[#a08060]'
            }`}
          >
            {booth.name}
          </h4>
        </div>
      </div>

      <div className="shrink-0">
        {isAcquired ? (
          <CheckCircle size={18} weight="fill" className="text-[#7ec850]" />
        ) : (
          <span className="font-pixel text-[9px] text-[#f0d060] bg-[#2d1b0e] px-2 py-1 rounded border border-[#5a3a18]">
            Buka
          </span>
        )}
      </div>
    </button>
  );
};
