const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Deep link callback subscription
  onDeepLink: (callback) => {
    const listener = (_event, value) => callback(value);
    ipcRenderer.on('open-deep-link', listener);
    return () => {
      ipcRenderer.removeListener('open-deep-link', listener);
    };
  },
  
  // Native navigation listener
  onNavigate: (callback) => {
    const listener = (_event, value) => callback(value);
    ipcRenderer.on('navigate', listener);
    return () => {
      ipcRenderer.removeListener('navigate', listener);
    };
  },
  
  // Dialog operations
  openDialog: (options) => ipcRenderer.invoke('dialog:open', options),
  saveDialog: (options) => ipcRenderer.invoke('dialog:save', options),
  
  // OS Native Notification trigger
  showNotification: (options) => ipcRenderer.send('notification:show', options),

  // Incoming call — triggers native notification + taskbar flash + click-to-navigate
  showIncomingCallNotification: (options) => ipcRenderer.send('incoming-call:show', options),
  dismissIncomingCall: () => ipcRenderer.send('incoming-call:dismiss'),
  
  // Platform metadata queries
  getSystemInfo: () => ipcRenderer.invoke('system:info'),
  getAppPath: (name) => ipcRenderer.invoke('system:getPath', name),

  // Auto-updater API
  checkForUpdates: () => ipcRenderer.invoke('updater:check'),
  quitAndInstall: () => ipcRenderer.invoke('updater:quit-and-install'),
  getAppVersion: () => ipcRenderer.invoke('updater:get-version'),
  onUpdaterStatus: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on('updater-status', listener);
    return () => ipcRenderer.removeListener('updater-status', listener);
  },
  onUpdaterProgress: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on('updater-progress', listener);
    return () => ipcRenderer.removeListener('updater-progress', listener);
  }
});

