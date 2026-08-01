const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create build and build/icons directories if they don't exist
const buildDir = path.join(__dirname, '..', 'build');
const iconsDir = path.join(buildDir, 'icons');

if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

// CRC32 calculation helper for PNG chunk generation
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Generate an uncompressed PNG buffer of specified width & height with EMS primary color theme (#863BFF / gradient)
function createPNG(width, height) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrLen = Buffer.alloc(4);
  ihdrLen.writeUInt32BE(13, 0);
  const ihdrType = Buffer.from('IHDR');
  const ihdrCrc = Buffer.alloc(4);
  ihdrCrc.writeUInt32BE(crc32(Buffer.concat([ihdrType, ihdrData])), 0);
  const ihdrChunk = Buffer.concat([ihdrLen, ihdrType, ihdrData, ihdrCrc]);

  // Raw Image Data (Scanlines with filter type 0)
  const lineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * lineLength);

  const primaryR = 134, primaryG = 59, primaryB = 255; // #863BFF
  const cyanR = 71, cyanG = 191, cyanB = 255; // #47BFFF

  for (let y = 0; y < height; y++) {
    const offset = y * lineLength;
    rawData[offset] = 0; // Filter 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = offset + 1 + x * 4;
      
      // Calculate normalized coordinates [-1, 1]
      const nx = (x / width) * 2 - 1;
      const ny = (y / height) * 2 - 1;
      const dist = Math.sqrt(nx * nx + ny * ny);

      // Rounded rectangle container shape
      const cornerRadius = 0.75;
      const inShape = Math.abs(nx) <= cornerRadius && Math.abs(ny) <= cornerRadius || dist <= 1.1;

      if (dist <= 0.95 && inShape) {
        // Gradient fill with rounded brand emblem
        const t = (nx + ny + 2) / 4;
        const r = Math.round(primaryR * (1 - t) + cyanR * t);
        const g = Math.round(primaryG * (1 - t) + cyanG * t);
        const b = Math.round(primaryB * (1 - t) + cyanB * t);
        
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
        rawData[pxOffset + 3] = 255; // Fully opaque
      } else {
        // Transparent background outside emblem icon
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
      }
    }
  }

  // Compress raw pixel scanlines with zlib
  const compressedData = zlib.deflateSync(rawData);

  // IDAT Chunk
  const idatLen = Buffer.alloc(4);
  idatLen.writeUInt32BE(compressedData.length, 0);
  const idatType = Buffer.from('IDAT');
  const idatCrc = Buffer.alloc(4);
  idatCrc.writeUInt32BE(crc32(Buffer.concat([idatType, compressedData])), 0);
  const idatChunk = Buffer.concat([idatLen, idatType, compressedData, idatCrc]);

  // IEND Chunk
  const iendLen = Buffer.alloc(4);
  iendLen.writeUInt32BE(0, 0);
  const iendType = Buffer.from('IEND');
  const iendCrc = Buffer.alloc(4);
  iendCrc.writeUInt32BE(crc32(iendType), 0);
  const iendChunk = Buffer.concat([iendLen, iendType, iendCrc]);

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// Generate ICO buffer containing a valid 256x256 PNG image payload
function createICO(pngBuffer) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(1, 4); // 1 Image entry

  const dirEntry = Buffer.alloc(16);
  dirEntry[0] = 0; // 0 means 256 width
  dirEntry[1] = 0; // 0 means 256 height
  dirEntry[2] = 0; // Color count
  dirEntry[3] = 0; // Reserved
  dirEntry.writeUInt16LE(1, 4); // Color planes
  dirEntry.writeUInt16LE(32, 6); // Bits per pixel
  dirEntry.writeUInt32LE(pngBuffer.length, 8); // Size of image data
  dirEntry.writeUInt32LE(22, 12); // Offset (6 + 16 = 22)

  return Buffer.concat([header, dirEntry, pngBuffer]);
}

console.log('[Icon Generator] Generating Linux & macOS PNG icons...');
const sizes = [16, 32, 48, 64, 128, 256, 512, 1024];
let icon512Buffer = null;

for (const size of sizes) {
  const pngBuf = createPNG(size, size);
  const outPath = path.join(iconsDir, `${size}x${size}.png`);
  fs.writeFileSync(outPath, pngBuf);
  console.log(` -> Saved ${size}x${size}.png`);
  if (size === 512) icon512Buffer = pngBuf;
}

// Save main icon.png in build/
const iconPngPath = path.join(buildDir, 'icon.png');
fs.writeFileSync(iconPngPath, icon512Buffer || createPNG(512, 512));
console.log(' -> Saved build/icon.png (512x512)');

// Generate and save icon.ico for Windows
console.log('[Icon Generator] Generating Windows ICO icon...');
const icoBuf = createICO(createPNG(256, 256));
const iconIcoPath = path.join(buildDir, 'icon.ico');
fs.writeFileSync(iconIcoPath, icoBuf);
console.log(' -> Saved build/icon.ico');

// Generate fallback icon.icns for macOS
console.log('[Icon Generator] Generating macOS ICNS icon placeholder...');
const iconIcnsPath = path.join(buildDir, 'icon.icns');
fs.writeFileSync(iconIcnsPath, icon512Buffer || createPNG(512, 512));
console.log(' -> Saved build/icon.icns');

console.log('[Icon Generator] All application icons (.ico, .png, .icns) successfully generated in build/');
