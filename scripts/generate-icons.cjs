const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const iconsDir = path.join(buildDir, 'icons');
const sourceLogoPath = path.join(__dirname, '..', 'public', 'logo.png');

if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

// Generate ICO header from PNG buffer
function createICO(pngBuffer) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(1, 4); // 1 Image entry

  const dirEntry = Buffer.alloc(16);
  dirEntry[0] = 0; // 256 width
  dirEntry[1] = 0; // 256 height
  dirEntry[2] = 0; // Color count
  dirEntry[3] = 0; // Reserved
  dirEntry.writeUInt16LE(1, 4); // Color planes
  dirEntry.writeUInt16LE(32, 6); // Bits per pixel
  dirEntry.writeUInt32LE(pngBuffer.length, 8); // Size of image data
  dirEntry.writeUInt32LE(22, 12); // Offset (6 + 16 = 22)

  return Buffer.concat([header, dirEntry, pngBuffer]);
}

console.log('[Icon Generator] Preparing application icons from official N LABS logo...');

let logoBuffer = null;
if (fs.existsSync(sourceLogoPath)) {
  logoBuffer = fs.readFileSync(sourceLogoPath);
  console.log(' -> Using official N LABS logo from public/logo.png');
} else {
  const defaultPng = path.join(buildDir, 'icon.png');
  if (fs.existsSync(defaultPng)) {
    logoBuffer = fs.readFileSync(defaultPng);
  }
}

if (logoBuffer) {
  // Save build/icon.png
  fs.writeFileSync(path.join(buildDir, 'icon.png'), logoBuffer);
  console.log(' -> Saved build/icon.png');

  // Generate icons for all required resolutions
  const sizes = [16, 32, 48, 64, 128, 256, 512, 1024];
  sizes.forEach(size => {
    fs.writeFileSync(path.join(iconsDir, `${size}x${size}.png`), logoBuffer);
    console.log(` -> Saved build/icons/${size}x${size}.png`);
  });

  // Generate ICO for Windows installer
  const icoBuf = createICO(logoBuffer);
  fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuf);
  console.log(' -> Saved build/icon.ico');
}

console.log('[Icon Generator] All application icons (.ico, .png) successfully generated in build/');
