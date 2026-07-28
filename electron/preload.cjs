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
  getSystemInfo: () => ipcRenderer.invoke('system:info')
});

