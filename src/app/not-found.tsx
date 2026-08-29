import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#2d1b0e] text-[#f0e0c0] text-center px-4 selection:bg-[#7ec850] selection:text-[#1b120a]">
      <div
        className="font-pixel text-6xl sm:text-8xl font-bold text-[#f0d060] drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)]"
        style={{ textShadow: '2px 2px 0 #6b4f2e, 4px 4px 0 #1b120a, 0 0 20px rgba(240, 208, 96, 0.4)' }}
      >
        404
      </div>
      <h1 className="font-pixel text-xs sm:text-sm text-white mt-5 tracking-wider">
        HALAMAN TIDAK DITEMUKAN
      </h1>
      <p className="font-sans text-xs sm:text-sm text-[#c4956a] mt-2 max-w-sm leading-relaxed">
        Koridor ini sepertinya tidak ada di gedung 9 lantai. Kembali ke lobi untuk
        melanjutkan petualanganmu.
      </p>
      <Link
        href="/"
        className="mt-7 rpg-btn-primary py-3 px-6 text-xs font-pixel font-bold uppercase inline-block"
      >
        Kembali ke Lobi
      </Link>
    </div>
  );
}
