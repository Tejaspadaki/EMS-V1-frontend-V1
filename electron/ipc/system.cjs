const { ipcMain, dialog, Notification, BrowserWindow } = require('electron');
const os = require('os');

function registerSystemIPCHandlers() {
  // IPC handle for Open File / Folder Dialog
  ipcMain.handle('dialog:open', async (event, options) => {
    const result = await dialog.showOpenDialog(options);
    return result;
  });

  // IPC handle for Save File Dialog
  ipcMain.handle('dialog:save', async (event, options) => {
    const result = await dialog.showSaveDialog(options);
    return result;
  });

  // IPC handle for OS Native Notification
  ipcMain.on('notification:show', (event, { title, body }) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show();
    }
  });

  // IPC handle for Incoming Call — shows native notification + flashes taskbar
  ipcMain.on('incoming-call:show', (event, { title, body, route }) => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];

    // Flash the taskbar/dock icon to get attention
    if (win) {
      win.flashFrame(true);
      // Stop flashing when user focuses the window
      win.once('focus', () => win.flashFrame(false));
    }

    // Show native OS notification
    if (Notification.isSupported()) {
      const notification = new Notification({
        title,
        body,
        urgency: 'critical',
        timeoutType: 'never',
        silent: false,
      });

      // When the user clicks the notification, focus the window and navigate
      notification.on('click', () => {
        if (win) {
          if (win.isMinimized()) win.restore();
          win.show();
          win.focus();
          win.flashFrame(false);
          if (route) {
            win.webContents.send('navigate', route);
          }
        }
      });

      notification.show();
    }
  });

  // IPC for dismissing flash (call declined/missed)
  ipcMain.on('incoming-call:dismiss', () => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (win) win.flashFrame(false);
  });

  // IPC handle for System Information
  ipcMain.handle('system:info', () => {
    return {
      platform: os.platform(),
      arch: os.arch(),
      totalMem: os.totalmem(),
      freeMem: os.freemem(),
      cpus: os.cpus().length
    };
  });
}

module.exports = { registerSystemIPCHandlers };
