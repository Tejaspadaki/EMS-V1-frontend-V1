export interface SystemInfo {
  platform: string;
  arch: string;
  totalMem: number;
  freeMem: number;
  cpus: number;
}

export interface ElectronAPI {
  onDeepLink: (callback: (url: string) => void) => void;
  onNavigate: (callback: (path: string) => void) => void;
  openDialog: (options: any) => Promise<any>;
  saveDialog: (options: any) => Promise<any>;
  showNotification: (options: { title: string; body: string }) => void;
  getSystemInfo: () => Promise<SystemInfo>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
