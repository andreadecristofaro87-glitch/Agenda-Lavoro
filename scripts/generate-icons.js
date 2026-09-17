import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgStandard = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Clean white background -->
  <rect width="512" height="512" rx="64" fill="#ffffff" />
  
  <!-- Irpiniambiente Official Green Tree Mark -->
  <g id="irpiniambiente-tree">
    <!-- Green Canopy Circle -->
    <circle cx="256" cy="230" r="172" fill="#2BA835" />
    
    <!-- Tree Trunk / Stem -->
    <path d="M 248 388 L 248 456 L 264 456 L 264 388 Z" fill="#2BA835" rx="3" />
    
    <!-- Slanted White Dashes (Canopy Foliage) -->
    <!-- Row 1 (top) -->
    <line x1="260" y1="126" x2="236" y2="168" stroke="#ffffff" stroke-width="18" stroke-linecap="round" />
    
    <!-- Row 2 -->
    <line x1="236" y1="186" x2="212" y2="228" stroke="#ffffff" stroke-width="18" stroke-linecap="round" />
    <line x1="276" y1="186" x2="252" y2="228" stroke="#ffffff" stroke-width="18" stroke-linecap="round" />
    
    <!-- Row 3 -->
    <line x1="216" y1="246" x2="192" y2="288" stroke="#ffffff" stroke-width="18" stroke-linecap="round" />
    <line x1="256" y1="246" x2="232" y2="288" stroke="#ffffff" stroke-width="18" stroke-linecap="round" />
    <line x1="296" y1="246" x2="272" y2="288" stroke="#ffffff" stroke-width="18" stroke-linecap="round" />
    
    <!-- Row 4 (base of canopy) -->
    <line x1="196" y1="306" x2="172" y2="348" stroke="#ffffff" stroke-width="18" stroke-linecap="round" />
    <line x1="236" y1="306" x2="212" y2="348" stroke="#ffffff" stroke-width="18" stroke-linecap="round" />
    <line x1="276" y1="306" x2="252" y2="348" stroke="#ffffff" stroke-width="18" stroke-linecap="round" />
    <line x1="316" y1="306" x2="292" y2="348" stroke="#ffffff" stroke-width="18" stroke-linecap="round" />
  </g>
</svg>`;

// Maskable icon with full-bleed white background and slightly more padding for Android safe-zone (circle/squircle crop)
const svgMaskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#ffffff" />
  <g transform="translate(51, 51) scale(0.8)">
    <circle cx="256" cy="230" r="172" fill="#2BA835" />
    <path d="M 248 388 L 248 456 L 264 456 L 264 388 Z" fill="#2BA835" rx="3" />
    <line x1="260" y1="126" x2="236" y2="168" stroke="#ffffff" stroke-width="18" stroke-linecap="round" />
    <line x1="236" y1="186" x2="212" y2="228" stroke="#ffffff" stroke-width="18" stroke-linecap="round" />
    <line x1="276" y1="186" x2="252" y2="228" stroke="#ffffff" stroke-width="18" stroke-linecap="round" />
    <line x1="216" y1="246" x2="192" y2="288" stroke="#ffffff" stroke-width="18" stroke-linecap="round" />
    <line x1="256" y1="246" x2="232" y2="288" stroke="#ffffff" stroke-width="18" stroke-linecap="round" />
    <line x1="296" y1="246" x2="272" y2="288" stroke="#ffffff" stroke-width="18" stroke-linecap="round" />
    <line x1="196" y1="306" x2="172" y2="348" stroke="#ffffff" stroke-width="18" stroke-linecap="round" />
    <line x1="236" y1="306" x2="212" y2="348" stroke="#ffffff" stroke-width="18" stroke-linecap="round" />
    <line x1="276" y1="306" x2="252" y2="348" stroke="#ffffff" stroke-width="18" stroke-linecap="round" />
    <line x1="316" y1="306" x2="292" y2="348" stroke="#ffffff" stroke-width="18" stroke-linecap="round" />
  </g>
</svg>`;

async function run() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write SVG files
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgStandard);
  fs.writeFileSync(path.join(publicDir, 'icon-maskable.svg'), svgMaskable);

  // Generate PNGs using Sharp
  const stdBuffer = Buffer.from(svgStandard);
  const maskableBuffer = Buffer.from(svgMaskable);

  // 192x192 PNG
  await sharp(stdBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'pwa-192x192.png'));
  await sharp(stdBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));

  // 512x512 PNG
  await sharp(stdBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-512x512.png'));
  await sharp(stdBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));

  // 512x512 Maskable PNG
  await sharp(maskableBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // 180x180 Apple Touch Icon (strictly PNG for iOS Safari)
  await sharp(stdBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(stdBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon-180x180.png'));

  // Favicon PNG (64x64 & 32x32)
  await sharp(stdBuffer).resize(64, 64).png().toFile(path.join(publicDir, 'favicon.png'));

  console.log('All icons successfully generated!');
}

run().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
