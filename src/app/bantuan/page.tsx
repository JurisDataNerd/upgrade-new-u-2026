'use client';

import React from 'react';
import Link from 'next/link';
import {
  Info,
  Trophy,
  ArrowRight,
} from '@phosphor-icons/react';
import { Navbar } from '@/components/layout/Navbar';
import { CrtScanlines } from '@/components/layout/CrtScanlines';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { LEVEL_CONFIG } from '@/data/mockData';
import { soundEngine } from '@/lib/sound';
import { useGameStore } from '@/store/useGameStore';

export default function BantuanPage() {
  const soundEnabled = useGameStore((state) => state.soundEnabled);

  return (
    <div className="min-h-screen flex flex-col bg-[#2d1b0e] text-[#f0e0c0]">
      <CrtScanlines />
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#14230f] border border-[#7ec850] rounded-full px-4 py-1 shadow-md">
            <Info size={16} weight="fill" className="text-[#7ec850]" />
            <span className="font-pixel text-[10px] text-[#7ec850] font-bold uppercase tracking-wider">
              BUKU PANDUAN PETUALANG
            </span>
          </div>
          <h1 className="font-pixel text-xl sm:text-3xl font-extrabold text-[#f0d060]">
            PETUNJUK & CARA BERMAIN GENIUS
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#c4956a] max-w-2xl mx-auto">
            Pelajari alur orientasi virtual gedung 9 lantai UNU Yogyakarta, cara mengumpulkan 18 stempel, dan strategi naik ke level tertinggi!
          </p>
        </div>

        {/* 4 Step Visual Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sdv-card p-5 space-y-3">
            <div className="w-10 h-10 bg-[#170f07] border-2 border-[#7ec850] rounded-lg flex items-center justify-center font-pixel text-sm font-bold text-[#7ec850]">
              1
            </div>
            <h2 className="font-pixel text-xs font-bold text-white">
              PILIH LANTAI GEDUNG
            </h2>
            <p className="font-sans text-xs text-[#d0c0a0] leading-relaxed">
              Buka <strong className="text-[#7ec850]">Peta Gedung</strong> dan pilih lantai (Lantai 1 hingga Lantai 9) yang ingin kamu jelajahi.
            </p>
          </div>

          <div className="sdv-card p-5 space-y-3">
            <div className="w-10 h-10 bg-[#170f07] border-2 border-[#f0d060] rounded-lg flex items-center justify-center font-pixel text-sm font-bold text-[#f0d060]">
              2
            </div>
            <h2 className="font-pixel text-xs font-bold text-white">
              BACA CERITA BOOTH
            </h2>
            <p className="font-sans text-xs text-[#d0c0a0] leading-relaxed">
              Tiap lantai memiliki <strong className="text-[#f0d060]">2 Booth Corner</strong>. Baca wawasan seputar karakter, anti-narkoba, anti-kekerasan, dll.
            </p>
          </div>

          <div className="sdv-card p-5 space-y-3">
            <div className="w-10 h-10 bg-[#170f07] border-2 border-[#60a8d8] rounded-lg flex items-center justify-center font-pixel text-sm font-bold text-[#60a8d8]">
              3
            </div>
            <h2 className="font-pixel text-xs font-bold text-white">
              KERJAKAN KUIS
            </h2>
            <p className="font-sans text-xs text-[#d0c0a0] leading-relaxed">
              Jawab 2-4 soal pilihan ganda. Dapatkan skor minimal lulus untuk mengklaim <strong className="text-[#60a8d8]">Stempel Digital Resmi</strong>.
            </p>
          </div>

          <div className="sdv-card p-5 space-y-3">
            <div className="w-10 h-10 bg-[#170f07] border-2 border-[#f0d060] rounded-lg flex items-center justify-center font-pixel text-sm font-bold text-[#f0d060]">
              4
            </div>
            <h2 className="font-pixel text-xs font-bold text-white">
              UPGRADE NEW YOU!
            </h2>
            <p className="font-sans text-xs text-[#d0c0a0] leading-relaxed">
              Tuntaskan seluruh 9 lantai untuk membuka <strong className="text-[#f0d060]">Level Max</strong> dan cetak Sertifikat Kelulusanmu!
            </p>
          </div>
        </div>

        {/* Level Progression Table */}
        <div className="sdv-card-gold p-6 space-y-4">
          <div className="flex items-center gap-2 border-b-2 border-[#5a3a18] pb-3">
            <Trophy size={20} weight="fill" className="text-[#f0d060]" />
            <h2 className="font-pixel text-sm font-bold text-[#f0d060]">
              SISTEM TINGKATAN & LEVEL MAHASISWA
            </h2>
          </div>

          <div className="space-y-3">
            {LEVEL_CONFIG.map((lvl) => (
              <div
                key={lvl.level}
                className="p-3.5 bg-[#170f07] border-2 border-[#5a3a18] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">{lvl.badgeIcon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-xs font-bold text-white">
                        {lvl.title}
                      </span>
                      <PixelBadge variant="wood" size="sm">
                        {lvl.minFloors === lvl.maxFloors
                          ? `Semua 9 Lantai`
                          : `${lvl.minFloors} - ${lvl.maxFloors} Lantai Tuntas`}
                      </PixelBadge>
                    </div>
                    <p className="font-sans text-xs text-[#c4956a] mt-0.5">
                      {lvl.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="sdv-card p-6 space-y-4">
          <h2 className="font-pixel text-sm font-bold text-[#f0d060] border-b-2 border-[#5a3a18] pb-3">
            PERTANYAAN SERING DIAJUKAN (FAQ)
          </h2>

          <div className="space-y-4 font-sans text-xs sm:text-sm">
            <div className="space-y-1">
              <h3 className="font-pixel text-xs text-[#7ec850]">
                Q: Apakah harus scan QR code sungguhan di lokasi fisik?
              </h3>
              <p className="text-[#d0c0a0]">
                A: Tidak. Pada prototipe ini, semua 18 booth dapat langsung diakses lewat klik di peta gedung. Kamu juga bisa menggunakan fitur simulasi ketik kode QR (misal: B1-A, B4-A, dll).
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-pixel text-xs text-[#7ec850]">
                Q: Bagaimana jika jawaban kuis saya ada yang salah?
              </h3>
              <p className="text-[#d0c0a0]">
                A: Kamu bisa menekan tombol &quot;Ulangi Kuis&quot; kapan saja untuk mencoba kembali sampai seluruh soal terjawab benar dan stempel terbuka.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-pixel text-xs text-[#7ec850]">
                Q: Kapan lantai dinyatakan &quot;TUNTAS&quot;?
              </h3>
              <p className="text-[#d0c0a0]">
                A: Setiap lantai memiliki tepat 2 booth (Booth A & Booth B). Lantai baru berstatus TUNTAS jika KEDUA booth di lantai tersebut sudah berhasil kamu selesaikan dan distempel.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center py-4">
          <Link href="/peta">
            <button
              onClick={() => soundEnabled && soundEngine.playClick()}
              className="rpg-btn-primary py-4 px-8 text-xs font-pixel font-bold inline-flex items-center gap-3"
            >
              <span>Mulai Jelajahi Gedung Sekarang</span>
              <ArrowRight size={18} weight="bold" />
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
