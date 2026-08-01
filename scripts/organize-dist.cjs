const fs = require('fs');
const path = require('path');

const distElectron = path.join(__dirname, '..', 'dist-electron');
const distDir = path.join(__dirname, '..', 'dist');
const winDir = path.join(distDir, 'Windows');
const linuxDir = path.join(distDir, 'Linux');
const macDir = path.join(distDir, 'macOS');

if (!fs.existsSync(winDir)) fs.mkdirSync(winDir, { recursive: true });
if (!fs.existsSync(linuxDir)) fs.mkdirSync(linuxDir, { recursive: true });
if (!fs.existsSync(macDir)) fs.mkdirSync(macDir, { recursive: true });

function copyFile(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(` -> Copied ${path.basename(src)} -> ${path.relative(distDir, dest)}`);
  }
}

console.log('[Dist Organizer] Organizing production installers into dist/ directory structure...');

if (fs.existsSync(distElectron)) {
  const files = fs.readdirSync(distElectron);
  files.forEach(file => {
    const fullPath = path.join(distElectron, file);
    if (fs.statSync(fullPath).isDirectory()) return;

    // Windows Installers
    if (file.includes('Setup') && file.endsWith('.exe')) {
      copyFile(fullPath, path.join(winDir, 'Setup.exe'));
      copyFile(fullPath, path.join(winDir, file));
    } else if (file.includes('Portable') && file.endsWith('.exe')) {
      copyFile(fullPath, path.join(winDir, 'Portable.exe'));
      copyFile(fullPath, path.join(winDir, file));
    } else if (file.endsWith('.zip') && (file.includes('win') || file.includes('System') || file.includes('Employee'))) {
      copyFile(fullPath, path.join(winDir, 'ZIP'));
      copyFile(fullPath, path.join(winDir, file));
    }

    // Linux Installers
    if (file.endsWith('.AppImage')) {
      copyFile(fullPath, path.join(linuxDir, 'AppImage'));
      copyFile(fullPath, path.join(linuxDir, file));
    } else if (file.endsWith('.deb')) {
      copyFile(fullPath, path.join(linuxDir, 'DEB'));
      copyFile(fullPath, path.join(linuxDir, file));
    } else if (file.endsWith('.rpm')) {
      copyFile(fullPath, path.join(linuxDir, 'RPM'));
      copyFile(fullPath, path.join(linuxDir, file));
    }

    // macOS Installers
    if (file.endsWith('.dmg')) {
      copyFile(fullPath, path.join(macDir, 'DMG'));
      copyFile(fullPath, path.join(macDir, file));
    } else if (file.endsWith('.pkg')) {
      copyFile(fullPath, path.join(macDir, 'PKG'));
      copyFile(fullPath, path.join(macDir, file));
    } else if (file.endsWith('.zip') && (file.includes('mac') || file.includes('darwin'))) {
      copyFile(fullPath, path.join(macDir, 'ZIP'));
      copyFile(fullPath, path.join(macDir, file));
    }
  });
}

console.log('[Dist Organizer] Successfully organized dist/ structure!');
