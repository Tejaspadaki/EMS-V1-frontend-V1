import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Info, RefreshCw, CheckCircle2, AlertCircle, Download, Sparkles, Monitor, Terminal, Apple } from 'lucide-react';
import type { UpdaterStatusData, UpdaterProgressData } from '../../electron-api';

interface AppUpdaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStatus?: 'downloaded' | 'idle' | 'checking' | 'available';
  initialVersion?: string;
}

export const AppUpdaterModal: React.FC<AppUpdaterModalProps> = ({ 
  isOpen, 
  onClose,
  initialStatus = 'idle',
  initialVersion = '1.4.0'
}) => {
  const [currentVersion, setCurrentVersion] = useState<string>('1.4.0');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'>(initialStatus);
  const [targetVersion, setTargetVersion] = useState<string>(initialVersion);
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [checking, setChecking] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // Platform selection for downloads: 'windows' | 'linux' | 'mac'
  const getInitialPlatform = (): 'windows' | 'linux' | 'mac' => {
    if (typeof navigator === 'undefined') return 'windows';
    const ua = navigator.userAgent;
    if (/mac|darwin/i.test(ua)) return 'mac';
    if (/linux/i.test(ua)) return 'linux';
    return 'windows';
  };

  const [selectedPlatform, setSelectedPlatform] = useState<'windows' | 'linux' | 'mac'>(getInitialPlatform());
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

  useEffect(() => {
    if (!isOpen) return;
    setIsClosing(false);

    if (isElectron && window.electronAPI) {
      window.electronAPI.getAppVersion().then(ver => {
        if (ver) setCurrentVersion(ver);
      }).catch(() => {});

      const removeStatusListener = window.electronAPI.onUpdaterStatus((data: UpdaterStatusData) => {
        setChecking(false);
        if (data.status === 'checking') {
          setStatus('checking');
        } else if (data.status === 'available') {
          setStatus('available');
          if (data.version) setTargetVersion(data.version);
        } else if (data.status === 'not-available') {
          setStatus('not-available');
          if (data.version) setCurrentVersion(data.version);
        } else if (data.status === 'downloaded') {
          setStatus('downloaded');
          if (data.version) setTargetVersion(data.version);
        } else if (data.status === 'error') {
          setStatus('error');
          setErrorMessage(data.error || 'Failed to check or download update');
        }
      });

      const removeProgressListener = window.electronAPI.onUpdaterProgress((data: UpdaterProgressData) => {
        setStatus('downloading');
        setProgress(data.percent || 0);
      });

      return () => {
        if (typeof removeStatusListener === 'function') removeStatusListener();
        if (typeof removeProgressListener === 'function') removeProgressListener();
      };
    }
  }, [isOpen, isElectron]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleRestartNow = () => {
    if (isElectron && window.electronAPI) {
      window.electronAPI.quitAndInstall();
    } else {
      handleClose();
    }
  };

  // Base download paths for desktop application installers across platforms
  const downloadLinks = {
    windows: [
      {
        name: 'NSIS Installer (.exe)',
        badge: 'Recommended',
        desc: 'Standard Windows installer with auto-updates',
        file: `Employee Management System-Setup-${targetVersion}.exe`,
        path: `/updates/Windows/Employee%20Management%20System-Setup-${targetVersion}.exe`
      },
      {
        name: 'Portable (.exe)',
        badge: 'No Admin Required',
        desc: 'Run directly without installation',
        file: `Employee Management System-Portable-${targetVersion}.exe`,
        path: `/updates/Windows/Employee%20Management%20System-Portable-${targetVersion}.exe`
      },
      {
        name: 'ZIP Package (.zip)',
        badge: 'Archive',
        desc: 'Standalone executable compressed archive',
        file: `Employee Management System-${targetVersion}-win.zip`,
        path: `/updates/Windows/Employee%20Management%20System-${targetVersion}-win.zip`
      }
    ],
    linux: [
      {
        name: 'AppImage (.AppImage)',
        badge: 'Universal Linux',
        desc: 'Runs on Ubuntu, Fedora, Mint, Debian, Arch & all distros',
        file: `Employee Management System-${targetVersion}.AppImage`,
        path: `/updates/Linux/Employee%20Management%20System-${targetVersion}.AppImage`
      },
      {
        name: 'DEB Package (.deb)',
        badge: 'Ubuntu / Debian',
        desc: 'Native package for Debian, Ubuntu, Linux Mint, Pop!_OS',
        file: `Employee Management System_${targetVersion}_amd64.deb`,
        path: `/updates/Linux/Employee%20Management%20System_${targetVersion}_amd64.deb`
      },
      {
        name: 'RPM Package (.rpm)',
        badge: 'Fedora / RHEL',
        desc: 'Native package for Fedora, RedHat, CentOS, openSUSE',
        file: `Employee Management System-${targetVersion}.x86_64.rpm`,
        path: `/updates/Linux/Employee%20Management%20System-${targetVersion}.x86_64.rpm`
      }
    ],
    mac: [
      {
        name: 'DMG Disk Image (.dmg)',
        badge: 'Universal Mac',
        desc: 'Standard macOS installer for Intel & Apple Silicon (M1/M2/M3)',
        file: `Employee Management System-${targetVersion}.dmg`,
        path: `/updates/macOS/Employee%20Management%20System-${targetVersion}.dmg`
      },
      {
        name: 'ZIP Archive (.zip)',
        badge: 'Portable App',
        desc: 'Compressed .app bundle for direct drag-and-drop',
        file: `Employee Management System-${targetVersion}-mac.zip`,
        path: `/updates/macOS/Employee%20Management%20System-${targetVersion}-mac.zip`
      },
      {
        name: 'PKG Installer (.pkg)',
        badge: 'System Package',
        desc: 'Standard macOS system package installer',
        file: `Employee Management System-${targetVersion}.pkg`,
        path: `/updates/macOS/Employee%20Management%20System-${targetVersion}.pkg`
      }
    ]
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes updaterBackdropFadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(12px); }
        }
        @keyframes updaterBackdropFadeOut {
          from { opacity: 1; backdrop-filter: blur(12px); }
          to { opacity: 0; backdrop-filter: blur(0px); }
        }
        @keyframes updaterModalPopIn {
          0% { opacity: 0; transform: scale(0.90) translateY(16px); }
          70% { transform: scale(1.01) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes updaterModalPopOut {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.92) translateY(12px); }
        }
      `}</style>

      {/* Backdrop overlay */}
      <div 
        onClick={handleClose}
        style={{
          animation: isClosing 
            ? 'updaterBackdropFadeOut 0.2s ease-out forwards' 
            : 'updaterBackdropFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60"
      >
        {/* Modal Window */}
        <div 
          onClick={e => e.stopPropagation()}
          style={{
            animation: isClosing 
              ? 'updaterModalPopOut 0.2s ease-in forwards' 
              : 'updaterModalPopIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
          className="bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 max-w-[540px] w-full overflow-hidden transition-all relative"
        >
          
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 backdrop-blur-sm">
            <span className="text-sm font-semibold text-slate-800 tracking-wide flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600 animate-spin" style={{ animationDuration: '6s' }} />
              {isElectron ? 'EMS Desktop App Update' : 'Download EMS Desktop App'}
            </span>
            <button 
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors active:scale-90"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 space-y-6">

            {/* Platform Selection Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setSelectedPlatform('windows')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedPlatform === 'windows'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor size={15} />
                Windows
              </button>
              <button
                onClick={() => setSelectedPlatform('linux')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedPlatform === 'linux'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Terminal size={15} />
                Linux
              </button>
              <button
                onClick={() => setSelectedPlatform('mac')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedPlatform === 'mac'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Apple size={15} />
                macOS
              </button>
            </div>

            {/* Electron auto-update prompt */}
            {isElectron && status === 'downloaded' && (
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-3">
                <div className="flex items-center gap-3 text-sky-800">
                  <Info size={20} />
                  <p className="text-xs font-semibold">An update has been downloaded automatically!</p>
                </div>
                <button
                  onClick={handleRestartNow}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs rounded-lg transition-all"
                >
                  Restart Application Now
                </button>
              </div>
            )}

            {/* Download Installers List for Selected Platform */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {selectedPlatform === 'windows' && 'Windows Packages (.exe / .zip)'}
                  {selectedPlatform === 'linux' && 'Linux Packages (.AppImage / .deb / .rpm)'}
                  {selectedPlatform === 'mac' && 'macOS Packages (.dmg / .zip / .pkg)'}
                </h4>
                <span className="text-[11px] font-medium text-slate-400">v{targetVersion}</span>
              </div>

              <div className="space-y-2.5">
                {downloadLinks[selectedPlatform].map((item, idx) => (
                  <a
                    key={idx}
                    href={item.path}
                    download={item.file}
                    className="flex items-center justify-between p-3.5 border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/40 rounded-xl transition-all duration-200 group shadow-xs hover:shadow-sm"
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 shrink-0">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{item.desc}</p>
                    </div>

                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                      <Download size={18} />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Supports Windows 10/11, Linux & macOS (Intel & Apple Silicon)</span>
              <button
                onClick={handleClose}
                className="font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};
