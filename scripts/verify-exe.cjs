const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const pkg = require('../package.json');
const distElectron = path.join(__dirname, '..', 'dist-electron');

console.log('==================================================================');
console.log(`[BUILD VERIFIER] Validating Novynth Workflow v${pkg.version} Artifacts...`);
console.log('==================================================================');

if (!fs.existsSync(distElectron)) {
  console.error('❌ CRITICAL ERROR: dist-electron directory does not exist! Run electron-builder first.');
  process.exit(1);
}

// 1. Locate primary Windows Setup EXE
const files = fs.readdirSync(distElectron);
const setupExe = files.find(f => f.endsWith('.exe') && (f.includes('Setup') || f.includes('novynth') || f.includes('Novynth')));

if (!setupExe) {
  console.error('❌ CRITICAL ERROR: No Windows Setup .exe installer found in dist-electron/');
  console.error('Found files:', files);
  process.exit(1);
}

const exePath = path.join(distElectron, setupExe);
const stat = fs.statSync(exePath);
const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);

console.log(`\n🔍 Verifying Windows Installer Executable: ${setupExe}`);
console.log(`   Path: ${exePath}`);
console.log(`   Size: ${stat.size} bytes (${sizeMB} MB)`);

let hasErrors = false;

// 2. Check File Size (> 20 MB required for full Electron package)
if (stat.size < 20 * 1024 * 1024) {
  console.error(`❌ SIZE VERIFICATION FAILED: Executable size ${stat.size} bytes (${sizeMB} MB) is under 20 MB! Possible truncated build.`);
  hasErrors = true;
} else {
  console.log(`✅ Size Verification: Passed (${sizeMB} MB > 20 MB minimum)`);
}

// 3. Verify PE Executable Magic Bytes ('MZ')
const fd = fs.openSync(exePath, 'r');
const magicBuffer = Buffer.alloc(2);
fs.readSync(fd, magicBuffer, 0, 2, 0);
fs.closeSync(fd);

const magicHeader = magicBuffer.toString('ascii');
if (magicHeader !== 'MZ') {
  console.error(`❌ PE HEADER VERIFICATION FAILED: File header magic is '${magicHeader}'! Expected 'MZ' (0x4D 0x5A) for valid Windows PE executable.`);
  hasErrors = true;
} else {
  console.log(`✅ PE Header Verification: Passed ('MZ' signature present)`);
}

// 4. Compute Checksums
const fileBuffer = fs.readFileSync(exePath);
const sha256Hex = crypto.createHash('sha256').update(fileBuffer).digest('hex');
const sha512Base64 = crypto.createHash('sha512').update(fileBuffer).digest('base64');

console.log(`   SHA-256 (Hex): ${sha256Hex}`);
console.log(`   SHA-512 (Base64): ${sha512Base64}`);

// 5. Verify latest.yml metadata integrity
console.log(`\n🔍 Verifying latest.yml Metadata File...`);
const latestYmlPath = path.join(distElectron, 'latest.yml');

if (!fs.existsSync(latestYmlPath)) {
  console.error(`❌ METADATA ERROR: dist-electron/latest.yml does not exist!`);
  hasErrors = true;
} else {
  const ymlText = fs.readFileSync(latestYmlPath, 'utf8');
  console.log(`   latest.yml size: ${ymlText.length} bytes`);

  // Simple regex parsing for YAML fields
  const versionMatch = ymlText.match(/^version:\s*['"]?([^'"\r\n]+)['"]?/m);
  const pathMatch = ymlText.match(/^path:\s*['"]?([^'"\r\n]+)['"]?/m);
  const sha512Match = ymlText.match(/^sha512:\s*['"]?([^'"\r\n]+)['"]?/m);
  const sizeMatch = ymlText.match(/size:\s*(\d+)/);

  const ymlVersion = versionMatch ? versionMatch[1] : null;
  const ymlPath = pathMatch ? pathMatch[1] : null;
  const ymlSha512 = sha512Match ? sha512Match[1] : null;
  const ymlSize = sizeMatch ? parseInt(sizeMatch[1], 10) : null;

  console.log(`   YAML Version: ${ymlVersion}`);
  console.log(`   YAML Path:    ${ymlPath}`);
  console.log(`   YAML Size:    ${ymlSize}`);
  console.log(`   YAML SHA-512: ${ymlSha512}`);

  // Check version match
  if (ymlVersion !== pkg.version) {
    console.error(`❌ VERSION MISMATCH: latest.yml version (${ymlVersion}) does not match package.json version (${pkg.version})!`);
    hasErrors = true;
  } else {
    console.log(`✅ Metadata Version Match: Passed (v${ymlVersion})`);
  }

  // Check filename match
  if (ymlPath !== setupExe) {
    console.error(`❌ FILENAME MISMATCH: latest.yml path (${ymlPath}) does not match output installer (${setupExe})!`);
    hasErrors = true;
  } else {
    console.log(`✅ Metadata Filename Match: Passed (${ymlPath})`);
  }

  // Check size match
  if (ymlSize !== stat.size) {
    console.error(`❌ FILE SIZE MISMATCH: latest.yml size (${ymlSize}) does not match actual EXE size (${stat.size})!`);
    hasErrors = true;
  } else {
    console.log(`✅ Metadata File Size Match: Passed (${ymlSize} bytes)`);
  }

  // Check SHA-512 hash match
  if (ymlSha512 !== sha512Base64) {
    console.error(`❌ SHA-512 CHECKSUM MISMATCH!`);
    console.error(`   Expected in latest.yml: ${ymlSha512}`);
    console.error(`   Actual computed SHA512: ${sha512Base64}`);
    hasErrors = true;
  } else {
    console.log(`✅ Metadata SHA-512 Checksum Match: Passed 100%`);
  }
}

console.log('\n==================================================================');
if (hasErrors) {
  console.error('❌ BUILD VERIFICATION FAILED: Corrupted or mismatched release artifacts!');
  console.error('Process will exit with status code 1. Release upload MUST NOT proceed.');
  console.log('==================================================================');
  process.exit(1);
} else {
  console.log('✨ ALL BUILD ARTIFACTS AND METADATA CHECKS PASSED SUCCESSFULLY!');
  console.log('Executable binary is verified valid and safe for production release.');
  console.log('==================================================================');
  process.exit(0);
}
