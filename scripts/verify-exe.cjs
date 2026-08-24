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

const files = fs.readdirSync(distElectron);
const allExes = files.filter(f => f.endsWith('.exe'));

if (allExes.length === 0) {
  console.error('❌ CRITICAL ERROR: No .exe files found in dist-electron/');
  process.exit(1);
}

let hasErrors = false;

// 1. Verify PE Magic Bytes ('MZ') and minimum size for ALL generated EXEs
console.log(`\n🔍 Verifying all executable binaries in dist-electron/ (${allExes.length} found):`);
allExes.forEach(exeName => {
  const p = path.join(distElectron, exeName);
  const st = fs.statSync(p);
  const sizeMB = (st.size / (1024 * 1024)).toFixed(2);

  if (st.size < 20 * 1024 * 1024) {
    console.error(`❌ SIZE FAILED: ${exeName} is ${st.size} bytes (${sizeMB} MB), expected > 20 MB`);
    hasErrors = true;
  }

  const fd = fs.openSync(p, 'r');
  const buf = Buffer.alloc(2);
  fs.readSync(fd, buf, 0, 2, 0);
  fs.closeSync(fd);

  const magic = buf.toString('ascii');
  if (magic !== 'MZ') {
    console.error(`❌ PE HEADER FAILED: ${exeName} header is '${magic}' (expected 'MZ')`);
    hasErrors = true;
  } else {
    console.log(`   ✅ ${exeName}: ${sizeMB} MB, PE Header 'MZ' Valid`);
  }
});

// 2. Locate primary NSIS Setup EXE (specifically matching latest.yml)
const setupExe = files.find(f => f.endsWith('.exe') && f.includes('Setup')) ||
                 files.find(f => f.endsWith('.exe') && !f.includes('Portable'));

if (!setupExe) {
  console.error('❌ CRITICAL ERROR: Could not identify NSIS Setup .exe installer!');
  process.exit(1);
}

const setupPath = path.join(distElectron, setupExe);
const setupStat = fs.statSync(setupPath);
const setupFileBuffer = fs.readFileSync(setupPath);
const sha256Hex = crypto.createHash('sha256').update(setupFileBuffer).digest('hex');
const sha512Base64 = crypto.createHash('sha512').update(setupFileBuffer).digest('base64');

console.log(`\n🔍 Primary NSIS Setup Installer: ${setupExe}`);
console.log(`   Size: ${setupStat.size} bytes`);
console.log(`   SHA-256 (Hex): ${sha256Hex}`);
console.log(`   SHA-512 (Base64): ${sha512Base64}`);

// 3. Verify latest.yml metadata integrity against NSIS Setup EXE
console.log(`\n🔍 Verifying latest.yml Metadata File against ${setupExe}...`);
const latestYmlPath = path.join(distElectron, 'latest.yml');

if (!fs.existsSync(latestYmlPath)) {
  console.error(`❌ METADATA ERROR: dist-electron/latest.yml does not exist!`);
  hasErrors = true;
} else {
  const ymlText = fs.readFileSync(latestYmlPath, 'utf8');

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

  if (ymlVersion !== pkg.version) {
    console.error(`❌ VERSION MISMATCH: latest.yml version (${ymlVersion}) !== package.json version (${pkg.version})`);
    hasErrors = true;
  } else {
    console.log(`✅ Version Match: Passed (v${ymlVersion})`);
  }

  if (ymlPath !== setupExe) {
    console.error(`❌ FILENAME MISMATCH: latest.yml path (${ymlPath}) !== setup installer (${setupExe})`);
    hasErrors = true;
  } else {
    console.log(`✅ Filename Match: Passed (${ymlPath})`);
  }

  if (ymlSize !== setupStat.size) {
    console.error(`❌ FILE SIZE MISMATCH: latest.yml size (${ymlSize}) !== actual size (${setupStat.size})`);
    hasErrors = true;
  } else {
    console.log(`✅ File Size Match: Passed (${ymlSize} bytes)`);
  }

  if (ymlSha512 !== sha512Base64) {
    console.error(`❌ SHA-512 CHECKSUM MISMATCH!`);
    console.error(`   Expected in latest.yml: ${ymlSha512}`);
    console.error(`   Actual computed SHA512: ${sha512Base64}`);
    hasErrors = true;
  } else {
    console.log(`✅ SHA-512 Checksum Match: Passed 100%`);
  }
}

console.log('\n==================================================================');
if (hasErrors) {
  console.error('❌ BUILD VERIFICATION FAILED: Corrupted or mismatched release artifacts!');
  process.exit(1);
} else {
  console.log('✨ ALL BUILD ARTIFACTS AND METADATA CHECKS PASSED SUCCESSFULLY!');
  process.exit(0);
}
