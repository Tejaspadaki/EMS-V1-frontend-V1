const fs = require('fs');
const path = require('path');

const distElectron = path.join(__dirname, '..', 'dist-electron');
const winDir = path.join(distElectron, 'Windows');
const linuxDir = path.join(distElectron, 'Linux');

// Ensure base target subdirectories exist
[winDir, linuxDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function copyFile(src, dest) {
  if (fs.existsSync(src)) {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(` -> Copied ${path.basename(src)} -> ${path.relative(distElectron, dest)}`);
  }
}

console.log('[Dist Organizer] Organizing production installers into dist-electron/ directory structure...');

// Copy index.html download landing page into dist-electron root
const publicIndexHtml = path.join(__dirname, '..', 'public', 'updates', 'index.html');
if (fs.existsSync(publicIndexHtml)) {
  copyFile(publicIndexHtml, path.join(distElectron, 'index.html'));
}

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
    }

    // Linux Installers
    if (file.endsWith('.AppImage')) {
      copyFile(fullPath, path.join(linuxDir, 'AppImage', file));
      copyFile(fullPath, path.join(linuxDir, 'AppImage.AppImage'));
      copyFile(fullPath, path.join(linuxDir, file));
    } else if (file.endsWith('.deb')) {
      copyFile(fullPath, path.join(linuxDir, 'DEB', file));
      copyFile(fullPath, path.join(linuxDir, 'DEB.deb'));
      copyFile(fullPath, path.join(linuxDir, file));
    } else if (file.endsWith('.rpm')) {
      copyFile(fullPath, path.join(linuxDir, 'RPM', file));
      copyFile(fullPath, path.join(linuxDir, 'RPM.rpm'));
      copyFile(fullPath, path.join(linuxDir, file));
    }

    // Auto-update YAML metadata files
    if (file === 'latest.yml') {
      copyFile(fullPath, path.join(winDir, 'latest.yml'));
    } else if (file === 'latest-linux.yml') {
      copyFile(fullPath, path.join(linuxDir, 'latest-linux.yml'));
    }
  });
}

// Mirror all organized release files directly to EMS_Backend/backend/public/updates
const backendUpdatesDir = path.join(__dirname, '..', '..', 'EMS_Backend', 'backend', 'public', 'updates');
if (fs.existsSync(backendUpdatesDir)) {
  console.log('[Dist Organizer] Mirroring organized release files to EMS_Backend/backend/public/updates...');
  function copyFolderRecursiveSync(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const items = fs.readdirSync(src);
    items.forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      if (fs.statSync(srcPath).isDirectory()) {
        copyFolderRecursiveSync(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }
  copyFolderRecursiveSync(distElectron, backendUpdatesDir);
  console.log('[Dist Organizer] Successfully mirrored builds to EMS_Backend public updates portal!');
}

console.log('[Dist Organizer] Successfully organized dist-electron/ structure!');
