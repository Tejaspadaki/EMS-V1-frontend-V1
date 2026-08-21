const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const distElectron = path.join(__dirname, '..', 'dist-electron');
const winDir = path.join(distElectron, 'Windows');

console.log('====================================================');
console.log('[EXE Verifier] Validating Desktop Build Artifacts...');
console.log('====================================================');

if (!fs.existsSync(distElectron)) {
  console.error('❌ ERROR: dist-electron directory does not exist!');
  process.exit(1);
}

// Find all .exe files in dist-electron and dist-electron/Windows
function getExeFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile() && file.endsWith('.exe')) {
      results.push(filePath);
    }
  });
  return results;
}

const exeFiles = [...getExeFiles(distElectron), ...getExeFiles(winDir)];

if (exeFiles.length === 0) {
  console.error('❌ ERROR: No .exe installer files found in dist-electron!');
  process.exit(1);
}

let hasErrors = false;

exeFiles.forEach(exePath => {
  const relPath = path.relative(distElectron, exePath);
  const stat = fs.statSync(exePath);
  const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);

  // 1. Check size (> 20 MB minimum for valid Electron app)
  if (stat.size < 20 * 1024 * 1024) {
    console.error(`❌ INVALID BUILD: ${relPath} is only ${stat.size} bytes (${sizeMB} MB)! Expected > 20 MB.`);
    hasErrors = true;
    return;
  }

  // 2. Read first 2 bytes to verify PE Executable Header ('MZ')
  const fd = fs.openSync(exePath, 'r');
  const buffer = Buffer.alloc(2);
  fs.readSync(fd, buffer, 0, 2, 0);
  fs.closeSync(fd);

  const magic = buffer.toString('ascii');
  if (magic !== 'MZ') {
    console.error(`❌ CORRUPTED EXE: ${relPath} magic header is '${magic}' (Expected 'MZ' for PE Executable)!`);
    hasErrors = true;
    return;
  }

  // 3. Compute SHA-256 hash
  const fileBuffer = fs.readFileSync(exePath);
  const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  console.log(`✅ VALID EXE: ${relPath}`);
  console.log(`   Size: ${stat.size} bytes (${sizeMB} MB)`);
  console.log(`   Header: PE Executable ('MZ')`);
  console.log(`   SHA-256: ${sha256}`);
  console.log('----------------------------------------------------');
});

// 4. Verify latest.yml
const latestYmlPath = path.join(winDir, 'latest.yml');
if (fs.existsSync(latestYmlPath)) {
  const ymlContent = fs.readFileSync(latestYmlPath, 'utf8');
  console.log(`✅ VALID METADATA: Windows/latest.yml present`);
  if (!ymlContent.includes('version:')) {
    console.error(`❌ INVALID METADATA: Windows/latest.yml missing version field!`);
    hasErrors = true;
  }
} else {
  console.warn(`⚠️ WARNING: Windows/latest.yml not found in ${winDir}`);
}

if (hasErrors) {
  console.error('❌ BUILD VERIFICATION FAILED: Corrupted or invalid installer artifacts detected!');
  process.exit(1);
} else {
  console.log('✨ ALL BUILD ARTIFACTS VERIFIED SUCCESSFULLY!');
  process.exit(0);
}
