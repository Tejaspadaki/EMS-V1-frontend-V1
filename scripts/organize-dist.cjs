const fs = require('fs');
const path = require('path');

const distElectron = path.join(__dirname, '..', 'dist-electron');
const winDir = path.join(distElectron, 'Windows');
const linuxDir = path.join(distElectron, 'Linux');

// Ensure directories exist
[distElectron, winDir, linuxDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

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

// Organize build outputs in dist-electron
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
    }

    // Linux Build Artifacts & Metadata
    if (file.endsWith('.AppImage')) {
      copyFile(fullPath, path.join(linuxDir, file));
    } else if (file.endsWith('.deb')) {
      copyFile(fullPath, path.join(linuxDir, file));
    }

    if (file === 'latest-linux.yml') {
      copyFile(fullPath, path.join(linuxDir, 'latest-linux.yml'));
    }
  });
}

console.log('====================================================');
console.log('✨ Distribution artifacts successfully organized!');
console.log('====================================================');
