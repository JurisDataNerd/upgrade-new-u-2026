import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.resolve('public');

// 1. Create Master SVG Icon (Retro Pixel RPG UNU Genius 2026)
const masterSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Gradients -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2d1b0e"/>
      <stop offset="100%" stop-color="#140b05"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffe885"/>
      <stop offset="50%" stop-color="#f0d060"/>
      <stop offset="100%" stop-color="#c49520"/>
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2a5a3a"/>
      <stop offset="100%" stop-color="#14331e"/>
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3d2b1e"/>
      <stop offset="100%" stop-color="#1f140a"/>
    </linearGradient>
  </defs>

  <!-- Base Rounded Container with Stardew Valley Double-Inset Wood Frame -->
  <rect x="16" y="16" width="480" height="480" rx="96" fill="url(#bgGrad)" stroke="#5a3a18" stroke-width="16"/>
  <rect x="36" y="36" width="440" height="440" rx="80" fill="none" stroke="#8b6f4e" stroke-width="8"/>
  <rect x="52" y="52" width="408" height="408" rx="68" fill="url(#emeraldGrad)" stroke="#f0d060" stroke-width="12"/>

  <!-- Pixel Corner Highlights -->
  <rect x="76" y="76" width="16" height="16" fill="#f0d060" opacity="0.8"/>
  <rect x="420" y="76" width="16" height="16" fill="#f0d060" opacity="0.8"/>
  <rect x="76" y="420" width="16" height="16" fill="#f0d060" opacity="0.8"/>
  <rect x="420" y="420" width="16" height="16" fill="#f0d060" opacity="0.8"/>

  <!-- Center Golden Crown / Cap Emblem -->
  <!-- Crown Base -->
  <path d="M 176 170 L 210 130 L 256 165 L 302 130 L 336 170 L 320 200 L 192 200 Z" fill="url(#goldGrad)" stroke="#1a1005" stroke-width="6"/>
  <!-- Crown Jewels -->
  <circle cx="210" cy="130" r="10" fill="#7ec850" stroke="#1a1005" stroke-width="3"/>
  <circle cx="256" cy="165" r="12" fill="#60a8d8" stroke="#1a1005" stroke-width="3"/>
  <circle cx="302" cy="130" r="10" fill="#7ec850" stroke="#1a1005" stroke-width="3"/>

  <!-- Bold Pixel 'U' Emblem -->
  <!-- Left Pillar -->
  <rect x="160" y="215" width="56" height="135" rx="10" fill="url(#goldGrad)" stroke="#1a1005" stroke-width="8"/>
  <!-- Right Pillar -->
  <rect x="296" y="215" width="56" height="135" rx="10" fill="url(#goldGrad)" stroke="#1a1005" stroke-width="8"/>
  <!-- Bottom Curve -->
  <path d="M 160 310 C 160 385, 352 385, 352 310 L 296 310 C 296 350, 216 350, 216 310 Z" fill="url(#goldGrad)" stroke="#1a1005" stroke-width="8"/>

  <!-- Inner Shimmer of 'U' -->
  <rect x="174" y="228" width="16" height="90" rx="4" fill="#ffffff" opacity="0.4"/>
  <rect x="310" y="228" width="16" height="90" rx="4" fill="#ffffff" opacity="0.4"/>

  <!-- Star Sparkles -->
  <!-- Top Right Sparkle -->
  <path d="M 390 150 Q 390 175 415 175 Q 390 175 390 200 Q 390 175 365 175 Q 390 175 390 150 Z" fill="#ffe885"/>
  <circle cx="390" cy="175" r="5" fill="#ffffff"/>

  <!-- Bottom Left Sparkle -->
  <path d="M 120 340 Q 120 358 138 358 Q 120 358 120 376 Q 120 358 102 358 Q 120 358 120 340 Z" fill="#7ec850"/>

  <!-- Subtitle Tag: 2026 / GENIUS -->
  <rect x="180" y="395" width="152" height="34" rx="8" fill="#140b05" stroke="#f0d060" stroke-width="4"/>
  <text x="256" y="418" font-family="'Press Start 2P', monospace, sans-serif" font-size="14" font-weight="bold" fill="#f0d060" text-anchor="middle" letter-spacing="2">GENIUS</text>
</svg>
`.trim();

// Function to generate multi-size ICO binary buffer
function createIco(pngBuffers, sizes) {
  const count = pngBuffers.length;
  // Header: 6 bytes
  const headerSize = 6;
  // Directory entries: 16 bytes each
  const dirSize = 16 * count;
  let offset = headerSize + dirSize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type: 1 = ICO
  header.writeUInt16LE(count, 4); // Count

  const entries = [];
  for (let i = 0; i < count; i++) {
    const size = sizes[i];
    const buf = pngBuffers[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // Width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(buf.length, 8); // Image size in bytes
    entry.writeUInt32LE(offset, 12); // Image offset
    entries.push(entry);
    offset += buf.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers]);
}

async function buildIcons() {
  console.log('Generating icons for UNU Genius 2026...');

  // 1. Write favicon.svg
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), masterSvg, 'utf-8');
  console.log('✓ Created public/favicon.svg');

  const svgBuffer = Buffer.from(masterSvg);

  // 2. Generate PNG sizes
  const sizes = [16, 32, 48, 64, 180, 192, 512];
  const pngMap = {};

  for (const size of sizes) {
    const png = await sharp(svgBuffer)
      .resize(size, size)
      .png({ quality: 100, compressionLevel: 9 })
      .toBuffer();
    pngMap[size] = png;
  }

  // Write individual PNG icons
  fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), pngMap[16]);
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), pngMap[32]);
  fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), pngMap[48]);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngMap[180]);
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), pngMap[192]);
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), pngMap[512]);
  console.log('✓ Created PNG icons (16x16, 32x32, 48x48, 180x180, 192x192, 512x512)');

  // 3. Generate multi-resolution favicon.ico (16, 32, 48, 64)
  const icoSizes = [16, 32, 48, 64];
  const icoBuffers = icoSizes.map((s) => pngMap[s]);
  const icoBuffer = createIco(icoBuffers, icoSizes);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('✓ Created public/favicon.ico (Multi-size 16/32/48/64)');

  // 4. Generate site.webmanifest (PWA support)
  const manifest = {
    name: "UNU Genius 2026 — Upgrade New You",
    short_name: "UNU Genius",
    description: "Gamifikasi Orientasi Mahasiswa Baru UNU Yogyakarta 2026",
    start_url: "/",
    display: "standalone",
    background_color: "#2d1b0e",
    theme_color: "#1c120a",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  };
  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2), 'utf-8');
  console.log('✓ Created public/site.webmanifest');

  console.log('All icons created successfully!');
}

buildIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
