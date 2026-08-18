'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkle,
  Trophy,
  CheckCircle,
  CaretRight,
  QrCode,
  ShieldCheck,
  Heartbeat,
  UsersThree,
  Books,
  Flask,
  RocketLaunch,
  Scales,
  DoorOpen,
  X,
  ArrowRight,
} from '@phosphor-icons/react';
import { FLOORS_DATA, BOOTHS_DATA, LEVEL_CONFIG } from '@/data/mockData';
import { useGameStore } from '@/store/useGameStore';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelProgress } from '@/components/ui/PixelProgress';
import { soundEngine } from '@/lib/sound';
import { Booth } from '@/types/game';

export const BuildingMap: React.FC = () => {
  const router = useRouter();
  const participant = useGameStore((state) => state.participant);
  const getFloorStatus = useGameStore((state) => state.getFloorStatus);
  const getCompletedFloorsCount = useGameStore((state) => state.getCompletedFloorsCount);
  const currentLevel = useGameStore((state) => state.getCurrentLevel());
  const soundEnabled = useGameStore((state) => state.soundEnabled);

  const [selectedFloorNumber, setSelectedFloorNumber] = useState<number>(1);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [qrInputCode, setQrInputCode] = useState<string>('');
  const [qrErrorMessage, setQrErrorMessage] = useState<string>('');

  const completedFloors = getCompletedFloorsCount();
  const currentLevelData = LEVEL_CONFIG.find((l) => l.level === currentLevel) || LEVEL_CONFIG[0];

  const selectedFloor = FLOORS_DATA.find((f) => f.number === selectedFloorNumber) || FLOORS_DATA[0];
  const selectedBoothA = BOOTHS_DATA[selectedFloor.boothIds[0]];
  const selectedBoothB = BOOTHS_DATA[selectedFloor.boothIds[1]];

  const handleSelectFloor = (floorNum: number) => {
    setSelectedFloorNumber(floorNum);
    if (soundEnabled) soundEngine.playSelect();
  };

  const handleQrLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = qrInputCode.trim().toUpperCase();
    const foundBooth = Object.values(BOOTHS_DATA).find(
      (b) => b.code.toUpperCase() === cleanCode || b.id.toLowerCase() === cleanCode.toLowerCase()
    );

    if (foundBooth) {
      if (soundEnabled) soundEngine.playCorrect();
      router.push(`/booth/${foundBooth.id}`);
    } else {
      if (soundEnabled) soundEngine.playWrong();
      setQrErrorMessage('Kode Booth tidak ditemukan. Coba format seperti B1-A, B4-A, atau B8-A.');
    }
  };

  const getCategoryBadgeVariant = (cat: Booth['category']) => {
    switch (cat) {
      case 'anti_korupsi':
        return 'gold';
      case 'anti_narkoba':
        return 'cyan';
      case 'anti_kekerasan':
        return 'red';
      case 'etika_digital':
        return 'cyan';
      case 'riset_inovasi':
        return 'emerald';
      case 'pengembangan_karir':
        return 'gold';
      default:
        return 'wood';
    }
  };

  const getFloorIcon = (iconName: string) => {
    switch (iconName) {
      case 'DoorOpen':
        return <DoorOpen size={20} weight="fill" />;
      case 'Heartbeat':
        return <Heartbeat size={20} weight="fill" />;
      case 'UsersThree':
        return <UsersThree size={20} weight="fill" />;
      case 'ShieldCheck':
        return <ShieldCheck size={20} weight="fill" />;
      case 'Books':
        return <Books size={20} weight="fill" />;
      case 'Flask':
        return <Flask size={20} weight="fill" />;
      case 'RocketLaunch':
        return <RocketLaunch size={20} weight="fill" />;
      case 'Scales':
        return <Scales size={20} weight="fill" />;
      case 'Trophy':
        return <Trophy size={20} weight="fill" />;
      default:
        return <DoorOpen size={20} weight="fill" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Top HUD Card: Level Progress & Floor Stats */}
      <div className="sdv-card-gold p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Player Level info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#170f07] border-2 border-[#f0d060] rounded-xl flex items-center justify-center text-3xl shrink-0 shadow-md">
              {currentLevelData.badgeIcon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[9px] text-[#f0d060] uppercase tracking-wider">
                  Level Saat Ini
                </span>
                <PixelBadge variant={completedFloors === 9 ? 'gold' : 'emerald'} size="sm">
                  {currentLevel}
                </PixelBadge>
              </div>
              <h2 className="font-pixel text-sm sm:text-base font-bold text-white mt-1">
                {participant.name}
              </h2>
              <p className="font-sans text-xs text-[#c4956a] mt-0.5">
                {currentLevelData.description}
              </p>
            </div>
          </div>

          {/* Center & Right: Progress Bars and Quick Action */}
          <div className="flex-1 max-w-xl space-y-3">
            <PixelProgress
              value={completedFloors}
              max={9}
              label={`PROGRESS LANTAI: ${completedFloors}/9 TUNTAS`}
              sublabel={`${participant.completedBooths.length}/18 Stempel`}
              color={completedFloors === 9 ? 'gold' : 'emerald'}
              height="md"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[11px] font-pixel text-[#f0d060]">
                  <Trophy size={14} weight="fill" /> {participant.totalXp} XP
                </span>
                <span className="text-[#5a3a18]">|</span>
                <span className="text-[11px] font-mono text-[#a08060]">
                  NIM: {participant.nim}
                </span>
              </div>

              {/* Simulation QR Scan shortcut */}
              <button
                onClick={() => {
                  setIsQrModalOpen(true);
                  if (soundEnabled) soundEngine.playClick();
                }}
                className="inline-flex items-center gap-1.5 font-pixel text-[9px] text-[#f0d060] hover:text-white bg-[#2d1b0e] px-3 py-1 border border-[#8b6f4e] hover:border-[#f0d060] rounded-md transition-colors shadow-sm cursor-pointer"
              >
                <QrCode size={14} weight="bold" />
                <span>Simulasi Scan QR Booth</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Exploration Section: 9-Story Tower + Selected Floor Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 9-Story Vertical Tower (Floor 9 down to Floor 1) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-pixel text-xs sm:text-sm font-bold text-[#f0d060] flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#7ec850] rounded-full animate-pulse" />
              EKSPLORASI GEDUNG 9 LANTAI
            </h3>
            <span className="text-[9px] font-pixel text-[#a08060]">
              PILIH LANTAI
            </span>
          </div>

          {/* Tower Floor Stack Container */}
          <div className="space-y-2 bg-[#2d1b0e] p-3 border-3 border-[#5a3a18] rounded-xl shadow-[inset_0_0_0_2px_#8b6f4e,0_4px_12px_rgba(0,0,0,0.5)]">
            {[...FLOORS_DATA].reverse().map((floor) => {
              const status = getFloorStatus(floor.number);
              const isSelected = selectedFloorNumber === floor.number;

              return (
                <button
                  key={floor.number}
                  onClick={() => handleSelectFloor(floor.number)}
                  className={`w-full text-left transition-all relative rounded-lg border-2 p-2.5 sm:p-3 flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#3d7828] to-[#255018] border-[#f0d060] text-white shadow-[0_4px_12px_rgba(0,0,0,0.5)] translate-x-1'
                      : status === 'completed'
                      ? 'bg-[#1f3a2b]/80 border-[#4a8030] text-[#e0f0d0] hover:border-[#7ec850]'
                      : status === 'partial'
                      ? 'bg-[#3d2b1e] border-[#d4af37]/80 text-[#f0e0c0] hover:border-[#f0d060]'
                      : 'bg-[#1f140a]/90 border-[#5a3a18] text-[#a08060] hover:border-[#8b6f4e]'
                  }`}
                >
                  {/* Left: Floor Icon & Floor Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Floor Number Badge */}
                    <div
                      className={`w-8 h-8 font-pixel text-xs font-bold rounded-md border-2 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#f0d060] text-[#1b120a] border-white shadow'
                          : status === 'completed'
                          ? 'bg-[#235736] text-[#7ec850] border-[#7ec850]'
                          : status === 'partial'
                          ? 'bg-[#5a3a18] text-[#f0d060] border-[#d4af37]'
                          : 'bg-[#2d1b0e] text-[#a08060] border-[#5a3a18]'
                      }`}
                    >
                      L{floor.number}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-xs font-bold truncate text-white">
                          Lantai {floor.number}
                        </span>
                        {floor.number === 9 && (
                          <Sparkle size={14} weight="fill" className="text-[#f0d060] shrink-0" />
                        )}
                      </div>
                      <p className="font-sans text-[11px] text-[#c4956a] truncate">
                        {floor.theme}
                      </p>
                    </div>
                  </div>

                  {/* Right: Status Pill & Count */}
                  <div className="flex items-center gap-2 shrink-0">
                    {status === 'completed' ? (
                      <PixelBadge variant="emerald" size="sm">
                        <CheckCircle size={12} weight="bold" /> 2/2 Tuntas
                      </PixelBadge>
                    ) : status === 'partial' ? (
                      <PixelBadge variant="gold" size="sm">
                        1/2 Selesai
                      </PixelBadge>
                    ) : (
                      <PixelBadge variant="slate" size="sm">
                        0/2 Booth
                      </PixelBadge>
                    )}
                    <CaretRight
                      size={16}
                      weight="bold"
                      className={`transition-transform ${
                        isSelected ? 'text-[#f0d060] translate-x-1' : 'text-[#8b6f4e]'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Status Legends */}
          <div className="flex items-center justify-between text-[9px] font-pixel text-[#a08060] px-2 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#7ec850] rounded-full" /> Tuntas (2/2)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#f0d060] rounded-full" /> Berjalan (1/2)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#5a3a18] rounded-full" /> Belum Mulai (0/2)
            </span>
          </div>
        </div>

        {/* Right Column: Selected Floor Detail & The 2 Booths */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header of Selected Floor */}
          <div className="sdv-card-elevated p-5">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#170f07] border-2 border-[#f0d060] text-[#f0d060] rounded-lg shadow-inner">
                  {getFloorIcon(selectedFloor.icon)}
                </div>
                <div>
                  <div className="font-pixel text-[9px] text-[#7ec850] uppercase tracking-wider">
                    LANTAI KE-{selectedFloor.number}
                  </div>
                  <h3 className="font-pixel text-sm sm:text-base font-bold text-white mt-0.5">
                    {selectedFloor.name}
                  </h3>
                </div>
              </div>

              {getFloorStatus(selectedFloor.number) === 'completed' && (
                <div className="hidden sm:flex items-center gap-1 bg-[#f0d060] text-[#1b120a] font-pixel text-[9px] font-bold px-2.5 py-1 rounded border border-[#6b4f2e]">
                  <Trophy size={14} weight="fill" />
                  <span>LANTAI TUNTAS</span>
                </div>
              )}
            </div>

            <p className="font-sans text-xs sm:text-sm text-[#f0e6d2] leading-relaxed border-t border-[#5a3a18] pt-3">
              {selectedFloor.description}
            </p>
          </div>

          {/* The 2 Booths of the Selected Floor */}
          <div className="space-y-3">
            <h4 className="font-pixel text-xs font-bold text-[#f0d060] px-1 flex items-center gap-2">
              <Sparkle size={14} weight="fill" className="text-[#f0d060]" />
              DAFTAR 2 BOOTH / CORNER DI LANTAI INI:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Booth 1 */}
              <BoothCard
                booth={selectedBoothA}
                isCompleted={participant.completedBooths.includes(selectedBoothA.id)}
                stampRecord={participant.stamps[selectedBoothA.id]}
                categoryVariant={getCategoryBadgeVariant(selectedBoothA.category)}
              />

              {/* Booth 2 */}
              <BoothCard
                booth={selectedBoothB}
                isCompleted={participant.completedBooths.includes(selectedBoothB.id)}
                stampRecord={participant.stamps[selectedBoothB.id]}
                categoryVariant={getCategoryBadgeVariant(selectedBoothB.category)}
              />
            </div>
          </div>

          {/* Tips Banner */}
          <div className="bg-[#23160c] border border-[#5a3a18] rounded-xl p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">💡</span>
              <p className="font-sans text-xs text-[#c4956a]">
                Selesaikan kuis di kedua booth untuk membuat lantai ini berstatus{' '}
                <strong className="text-[#7ec850]">Tuntas</strong> dan meng-upgrade level karaktermu.
              </p>
            </div>
            <Link href="/paspor" className="shrink-0">
              <PixelButton variant="ghost" size="sm">
                Lihat Paspor
              </PixelButton>
            </Link>
          </div>
        </div>
      </div>

      {/* QR Simulation Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0604]/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-gradient-to-b from-[#2d1b0e] to-[#1a1008] border-[3.5px] border-[#f0d060] rounded-2xl p-6 text-center relative shadow-2xl">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-3 right-3 text-[#f0d060] hover:text-white bg-[#3d2b1e] border border-[#8b6f4e] rounded-md p-1 cursor-pointer"
            >
              <X size={18} weight="bold" />
            </button>

            <div className="w-12 h-12 bg-[#170f07] border-2 border-[#f0d060] text-[#f0d060] rounded-xl mx-auto flex items-center justify-center mb-3">
              <QrCode size={28} weight="bold" />
            </div>

            <h3 className="font-pixel text-sm font-bold text-white mb-1">
              SIMULASI SCAN QR CODE
            </h3>
            <p className="font-sans text-xs text-[#c4956a] mb-4">
              Masukkan kode booth (misal: <code className="text-[#f0d060]">B1-A</code>,{' '}
              <code className="text-[#f0d060]">B4-A</code>, <code className="text-[#f0d060]">B8-A</code>)
              untuk langsung melompat ke booth tersebut.
            </p>

            <form onSubmit={handleQrLookup} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={qrInputCode}
                  onChange={(e) => {
                    setQrInputCode(e.target.value);
                    setQrErrorMessage('');
                  }}
                  placeholder="Ketik kode booth: B1-A"
                  className="w-full bg-[#170f07] border-2 border-[#5a3a18] focus:border-[#f0d060] rounded-lg px-3 py-2 text-center text-white font-pixel text-sm uppercase outline-none"
                />
                {qrErrorMessage && (
                  <p className="font-sans text-xs text-[#ff8080] mt-2 text-center">
                    {qrErrorMessage}
                  </p>
                )}
              </div>

              {/* Quick sample chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {['B1-A', 'B2-A', 'B4-A', 'B6-A', 'B8-A', 'B9-B'].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setQrInputCode(code)}
                    className="font-pixel text-[9px] bg-[#3d2b1e] hover:bg-[#4d3b2e] text-[#f0d060] px-2 py-0.5 rounded border border-[#5a3a18] cursor-pointer"
                  >
                    {code}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <PixelButton type="submit" variant="primary" size="md" className="w-full">
                  Buka Booth
                </PixelButton>
                <PixelButton
                  type="button"
                  variant="wood"
                  size="md"
                  onClick={() => setIsQrModalOpen(false)}
                  className="w-full"
                >
                  Tutup
                </PixelButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface BoothCardProps {
  booth: Booth;
  isCompleted: boolean;
  stampRecord?: { score: number; earnedAt: string };
  categoryVariant: 'emerald' | 'gold' | 'amber' | 'cyan' | 'red' | 'wood' | 'slate';
}

const BoothCard: React.FC<BoothCardProps> = ({
  booth,
  isCompleted,
  stampRecord,
  categoryVariant,
}) => {
  return (
    <div
      className={`sdv-card p-4 sm:p-5 flex flex-col justify-between transition-all ${
        isCompleted
          ? 'bg-[#1e3321] border-[#4a8030] shadow-[inset_0_0_0_1px_#7ec850]'
          : 'hover:border-[#8b6f4e]'
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="font-pixel text-[9px] bg-[#170f07] px-2 py-0.5 border border-[#5a3a18] rounded text-[#f0d060] font-bold">
              {booth.code}
            </span>
            <PixelBadge variant={categoryVariant} size="sm">
              {booth.badgeTag}
            </PixelBadge>
          </div>

          {isCompleted ? (
            <PixelBadge variant="emerald" size="sm">
              <CheckCircle size={12} weight="bold" /> DISTEMPEL
            </PixelBadge>
          ) : (
            <PixelBadge variant="slate" size="sm">
              BELUM SELESAI
            </PixelBadge>
          )}
        </div>

        {/* Booth Title & Icon */}
        <div className="flex items-start gap-3 mb-2">
          <div className="w-10 h-10 bg-[#170f07] border-2 border-[#5a3a18] rounded-lg flex items-center justify-center text-xl shrink-0">
            {booth.stampIcon}
          </div>
          <div>
            <h5 className="font-pixel text-xs sm:text-sm font-bold text-white leading-tight">
              {booth.name}
            </h5>
            <p className="font-sans text-xs text-[#c4956a] mt-1">
              {booth.subtitle}
            </p>
          </div>
        </div>

        {/* Story Excerpt */}
        <p className="font-sans text-xs text-[#f0e6d2] line-clamp-2 mt-2 leading-relaxed bg-[#170f07]/60 p-2.5 rounded border border-[#5a3a18]">
          {booth.story}
        </p>
      </div>

      {/* Footer Info & Action */}
      <div className="border-t border-[#5a3a18] pt-3 mt-4 flex items-center justify-between gap-2">
        <div className="text-[11px] font-sans text-[#a08060]">
          {isCompleted ? (
            <span className="text-[#7ec850] font-medium">
              Skor: {stampRecord?.score ?? 2}/2 • {stampRecord?.earnedAt}
            </span>
          ) : (
            <span>{booth.readingTime} + Kuis</span>
          )}
        </div>

        <Link href={`/booth/${booth.id}`}>
          <PixelButton
            variant={isCompleted ? 'wood' : 'primary'}
            size="sm"
            icon={<ArrowRight size={14} weight="bold" />}
          >
            {isCompleted ? 'Buka Lagi' : 'Masuk Booth'}
          </PixelButton>
        </Link>
      </div>
    </div>
  );
};
