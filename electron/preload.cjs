const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Deep link callback subscription
  onDeepLink: (callback) => {
    ipcRenderer.on('open-deep-link', (_event, value) => callback(value));
  },
  
  // Native navigation listener
  onNavigate: (callback) => {
    ipcRenderer.on('navigate', (_event, value) => callback(value));
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
  getSystemInfo: () => ipcRenderer.invoke('system:info')
});

