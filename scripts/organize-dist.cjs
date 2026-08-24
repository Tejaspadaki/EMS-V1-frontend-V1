const fs = require('fs');
const path = require('path');

const distElectron = path.join(__dirname, '..', 'dist-electron');
const winDir = path.join(distElectron, 'Windows');
const linuxDir = path.join(distElectron, 'Linux');

// Backend public updates folder path
const backendUpdatesDir = path.resolve(__dirname, '..', '..', 'EMS_Backend', 'backend', 'public', 'updates');
const backendWinDir = path.join(backendUpdatesDir, 'Windows');
const backendLinuxDir = path.join(backendUpdatesDir, 'Linux');

// Ensure directories exist
[distElectron, winDir, linuxDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

if (fs.existsSync(backendUpdatesDir)) {
  [backendUpdatesDir, backendWinDir, backendLinuxDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

function copyFile(src, dest) {
  if (fs.existsSync(src)) {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(` -> Copied ${path.basename(src)} -> ${dest}`);
  }
}

console.log('====================================================');
console.log('[Dist Organizer] Syncing production release artifacts...');
console.log('====================================================');

// 1. Sync public/updates/index.html portal page to dist-electron and backend
const publicIndexHtml = path.join(__dirname, '..', 'public', 'updates', 'index.html');
if (fs.existsSync(publicIndexHtml)) {
  copyFile(publicIndexHtml, path.join(distElectron, 'index.html'));
  if (fs.existsSync(backendUpdatesDir)) {
    copyFile(publicIndexHtml, path.join(backendUpdatesDir, 'index.html'));
  }
}

// 2. Organize build outputs in dist-electron and sync metadata to backend
if (fs.existsSync(distElectron)) {
  const files = fs.readdirSync(distElectron);
  files.forEach(file => {
    const fullPath = path.join(distElectron, file);
    if (fs.statSync(fullPath).isDirectory()) return;

    // Windows Build Artifacts & Metadata
    if (file.endsWith('.exe')) {
      copyFile(fullPath, path.join(winDir, file));
    }

    if (file === 'latest.yml') {
      copyFile(fullPath, path.join(winDir, 'latest.yml'));
      if (fs.existsSync(backendUpdatesDir)) {
        copyFile(fullPath, path.join(backendUpdatesDir, 'latest.yml'));
        copyFile(fullPath, path.join(backendWinDir, 'latest.yml'));
      }
    }

    // Linux Build Artifacts & Metadata
    if (file.endsWith('.AppImage')) {
      copyFile(fullPath, path.join(linuxDir, file));
    } else if (file.endsWith('.deb')) {
      copyFile(fullPath, path.join(linuxDir, file));
    }

    if (file === 'latest-linux.yml') {
      copyFile(fullPath, path.join(linuxDir, 'latest-linux.yml'));
      if (fs.existsSync(backendUpdatesDir)) {
        copyFile(fullPath, path.join(backendUpdatesDir, 'latest-linux.yml'));
        copyFile(fullPath, path.join(backendLinuxDir, 'latest-linux.yml'));
      }
    }
  });
}

console.log('====================================================');
console.log('✨ Distribution artifacts successfully organized and synced!');
console.log('====================================================');
