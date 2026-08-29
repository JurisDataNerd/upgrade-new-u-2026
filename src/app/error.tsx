'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('GENIUS UNU — page error:', error);
  }, [error]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#2d1b0e] text-[#f0e0c0] text-center px-4 selection:bg-[#7ec850] selection:text-[#1b120a]">
      <div
        className="font-pixel text-4xl sm:text-6xl font-bold text-[#ff8080] drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)]"
        style={{ textShadow: '2px 2px 0 #6b2e2e, 4px 4px 0 #1b120a' }}
      >
        ERROR
      </div>
      <h1 className="font-pixel text-xs sm:text-sm text-white mt-5 tracking-wider">
        SISTEM LANTAI GANGGUAN
      </h1>
      <p className="font-sans text-xs sm:text-sm text-[#c4956a] mt-2 max-w-sm leading-relaxed">
        Terjadi kesalahan tak terduga. Tenangkan diri, lalu coba lagi — progresmu
        tersimpan aman di perangkat ini.
      </p>
      <button onClick={reset} className="mt-7 rpg-btn-primary py-3 px-6 text-xs font-pixel font-bold uppercase">
        Coba Lagi
      </button>
    </div>
  );
}
