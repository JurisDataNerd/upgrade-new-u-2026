import type { Metadata, Viewport } from "next";
import { Press_Start_2P, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1c120a",
};

export const metadata: Metadata = {
  title: "GENIUS: Upgrade New You — Orientasi Mahasiswa UNU Yogyakarta",
  description:
    "Gamifikasi orientasi mahasiswa baru berbasis eksplorasi virtual gedung kampus 9 lantai UNU Yogyakarta. Koleksi 18 stempel karakter dan capai level Upgraded You!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${pressStart2P.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-[100dvh] flex flex-col font-sans bg-[#2d1b0e] text-[#f0e0c0] selection:bg-[#7ec850] selection:text-[#1b120a]">
        {children}
      </body>
    </html>
  );
}
