const { autoUpdater } = require('electron-updater');
const { dialog, Notification } = require('electron');

/**
 * Configure and initialize Automatic Desktop Application Updates.
 * Whenever a new release is published (GitHub Releases, Generic HTTPS Server, S3),
 * Electron will automatically check, download, and apply the update.
 */
function initAutoUpdater(mainWindow) {
  // 1. Configure Auto Updater Logging & Flags
  autoUpdater.autoDownload = true; // Automatically download new version in background
  autoUpdater.autoInstallOnAppQuit = true; // Silently install on application exit

  // 2. Event: Checking for update
  autoUpdater.on('checking-for-update', () => {
    console.log('[AUTO-UPDATER] Checking for desktop application updates...');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater-status', { status: 'checking' });
    }
  });

  // 3. Event: New update available
  autoUpdater.on('update-available', (info) => {
    console.log('[AUTO-UPDATER] New release version available:', info.version);
    if (Notification.isSupported()) {
      new Notification({
        title: 'EMS Desktop Update Available',
        body: `Version ${info.version} is downloading automatically in the background.`
      }).show();
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater-status', { status: 'available', version: info.version });
    }
  });

  // 4. Event: No update available (running latest version)
  autoUpdater.on('update-not-available', (info) => {
    console.log('[AUTO-UPDATER] Desktop app is up to date (v' + info.version + ').');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater-status', { status: 'not-available', version: info.version });
    }
  });

  // 5. Event: Download progress
  autoUpdater.on('download-progress', (progressObj) => {
    const percent = Math.round(progressObj.percent);
    console.log(`[AUTO-UPDATER] Download progress: ${percent}%`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater-progress', {
        percent,
        transferred: progressObj.transferred,
        total: progressObj.total,
        bytesPerSecond: progressObj.bytesPerSecond
      });
    }
  });

  // 6. Event: Update downloaded & ready to apply
  autoUpdater.on('update-downloaded', (info) => {
    console.log('[AUTO-UPDATER] Update downloaded successfully. Ready to install.');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater-status', { status: 'downloaded', version: info.version });
    }

    // Prompt user to restart & apply update immediately or on next launch
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready to Install',
      message: `EMS Desktop v${info.version} has been downloaded.`,
      detail: 'Restart the application now to apply the update automatically.',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
      cancelId: 1
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall(false, true);
      }
    });
  });

  // 7. Event: Error handling
  autoUpdater.on('error', (err) => {
    console.error('[AUTO-UPDATER] Update error:', err.message || err);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater-status', { status: 'error', error: err.message });
    }
  });

  // 8. Trigger check for updates (checks on startup + every 4 hours)
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.log('[AUTO-UPDATER] Check for updates skipped in dev mode or server offline:', err.message);
    });
  }, 5000);

  setInterval(() => {
    autoUpdater.checkForUpdates().catch(() => {});
  }, 4 * 60 * 60 * 1000);
}

module.exports = { initAutoUpdater };
