const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, execFileSync } = require('child_process');

// Configuration for required tools
const PACKAGES = [
  {
    name: 'winCodeSign',
    version: '2.6.0',
    url: 'https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.6.0/winCodeSign-2.6.0.7z',
    expectedSize: 5635384,
    exclude: ['darwin', 'linux'], // Exclude macOS/Linux symlinks
    subDir: 'winCodeSign'
  },
  {
    name: 'nsis',
    version: '3.0.4.1',
    url: 'https://github.com/electron-userland/electron-builder-binaries/releases/download/nsis-3.0.4.1/nsis-3.0.4.1.7z',
    expectedSize: 1618222,
    exclude: [],
    subDir: 'nsis'
  },
  {
    name: 'nsis-resources',
    version: '3.4.1',
    url: 'https://github.com/electron-userland/electron-builder-binaries/releases/download/nsis-resources-3.4.1/nsis-resources-3.4.1.7z',
    expectedSize: 730689,
    exclude: [],
    subDir: 'nsis'
  }
];

// Resolve main cache directory across operating systems
const cacheRoot = path.join(
  process.env.LOCALAPPDATA || (process.platform === 'win32'
    ? path.join(os.homedir(), 'AppData', 'Local')
    : path.join(process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache'))),
  'electron-builder',
  'Cache'
);

// Kill lingering Electron processes to prevent file lock errors
function killElectronProcesses() {
  console.log('[Cache Preparation] Checking for running Electron instances...');
  try {
    if (process.platform === 'win32') {
      try { execSync('taskkill /f /im electron.exe', { stdio: 'ignore' }); } catch (e) {}
      try { execSync('taskkill /f /im "Employee Management System.exe"', { stdio: 'ignore' }); } catch (e) {}
    } else {
      try { execSync('pkill -f electron || true', { stdio: 'ignore' }); } catch (e) {}
      try { execSync('pkill -f "Employee Management System" || true', { stdio: 'ignore' }); } catch (e) {}
    }
    console.log('[Cache Preparation] Terminated active Electron processes to unlock build files.');
  } catch (e) {
    // safe to ignore if no process is running
    console.log('[Cache Preparation] No active Electron processes found.');
  }
}

// Helper to delay execution
function sleep(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {}
}

async function preparePackage(pkg) {
  const packageCacheDir = path.join(cacheRoot, pkg.subDir);
  const targetName = `${pkg.name}-${pkg.version}`;
  const targetDir = path.join(packageCacheDir, targetName);
  const tempTargetDir = path.join(packageCacheDir, `${targetName}-temp`);
  const archiveName = `${targetName}.7z`;
  const archivePath = path.join(packageCacheDir, archiveName);

  console.log(`\n[Cache Preparation] Checking ${pkg.name} (${pkg.version})...`);
  console.log(`[Cache Preparation] Target directory: ${targetDir}`);

  // Create sub cache directory if it doesn't exist
  if (!fs.existsSync(packageCacheDir)) {
    fs.mkdirSync(packageCacheDir, { recursive: true });
  }

  // 1. Check if already extracted
  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    console.log(`[Cache Preparation] ${pkg.name} is already prepared. Skipping.`);
    return;
  }

  // Ensure temp directory is clean
  if (fs.existsSync(tempTargetDir)) {
    fs.rmSync(tempTargetDir, { recursive: true, force: true });
  }

  // 2. Find or download the archive
  let archiveValid = false;
  if (fs.existsSync(archivePath)) {
    const stats = fs.statSync(archivePath);
    if (pkg.expectedSize && stats.size === pkg.expectedSize) {
      console.log(`[Cache Preparation] Found existing valid archive: ${archivePath}`);
      archiveValid = true;
    } else {
      console.log(`[Cache Preparation] Existing archive size mismatch. Re-downloading.`);
      fs.rmSync(archivePath, { force: true });
    }
  }

  // Look for any download-temp archives left by electron-builder matching the size
  if (!archiveValid) {
    const files = fs.readdirSync(packageCacheDir);
    for (const file of files) {
      if (file.endsWith('.7z') && file !== archiveName) {
        const fullPath = path.join(packageCacheDir, file);
        const stats = fs.statSync(fullPath);
        if (pkg.expectedSize && stats.size === pkg.expectedSize) {
          console.log(`[Cache Preparation] Reusing downloaded temp archive: ${fullPath}`);
          fs.copyFileSync(fullPath, archivePath);
          archiveValid = true;
          break;
        }
      }
    }
  }

  // Download via axios if not found
  if (!archiveValid) {
    console.log(`[Cache Preparation] Downloading ${pkg.name} from ${pkg.url}...`);
    try {
      const axios = require('axios');
      const writer = fs.createWriteStream(archivePath);
      const response = await axios({
        url: pkg.url,
        method: 'GET',
        responseType: 'stream'
      });

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      console.log(`[Cache Preparation] Download completed.`);
    } catch (err) {
      console.error(`[Cache Preparation] Download failed for ${pkg.name}:`, err.message);
      process.exit(1);
    }
  }

  // 3. Resolve 7za path from 7zip-bin
  let path7za;
  try {
    path7za = require('7zip-bin').path7za;
  } catch (err) {
    console.error(`[Cache Preparation] Failed to resolve 7zip-bin:`, err.message);
    process.exit(1);
  }

  if (!path7za || !fs.existsSync(path7za)) {
    console.error(`[Cache Preparation] 7za binary not found at ${path7za}`);
    process.exit(1);
  }

  // 4. Extract archive
  console.log(`[Cache Preparation] Extracting ${archiveName} to temp folder...`);
  const extractArgs = ['x', '-y', archivePath, `-o${tempTargetDir}`];
  if (pkg.exclude && pkg.exclude.length > 0) {
    pkg.exclude.forEach(ex => {
      extractArgs.push(`-x!${ex}`);
    });
    console.log(`[Cache Preparation] Excluding paths: ${pkg.exclude.join(', ')} (avoids symlink issues)`);
  }

  try {
    execFileSync(path7za, extractArgs, { stdio: 'inherit' });
    console.log(`[Cache Preparation] Extraction completed.`);
  } catch (err) {
    console.error(`[Cache Preparation] Extraction failed:`, err.message);
    fs.rmSync(archivePath, { force: true }); // delete corrupt archive
    process.exit(1);
  }

  // 5. Rename temporary directory to final location with retries
  console.log(`[Cache Preparation] Moving files into final location: ${targetDir}`);
  let renamed = false;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
      }
      fs.renameSync(tempTargetDir, targetDir);
      renamed = true;
      console.log(`[Cache Preparation] Successfully prepared ${pkg.name}!`);
      break;
    } catch (err) {
      if (err.code === 'EPERM' || err.code === 'EBUSY') {
        console.log(`[Cache Preparation] Lock detected, retrying rename in 1s... (Attempt ${attempt}/5)`);
        sleep(1000);
      } else {
        console.error(`[Cache Preparation] Failed to rename temp directory:`, err.message);
        process.exit(1);
      }
    }
  }

  if (!renamed) {
    console.error(`[Cache Preparation] Failed to move ${pkg.name} to final location after 5 attempts.`);
    process.exit(1);
  }
}

async function run() {
  killElectronProcesses();
  for (const pkg of PACKAGES) {
    await preparePackage(pkg);
  }
  console.log('\n[Cache Preparation] All Electron Builder dependencies successfully prepared and cached.');
}

run().catch(err => {
  console.error('[Cache Preparation] Execution error:', err);
  process.exit(1);
});
