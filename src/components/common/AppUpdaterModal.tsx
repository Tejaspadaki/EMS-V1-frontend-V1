import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Info, RefreshCw, CheckCircle2, AlertCircle, Download, Sparkles } from 'lucide-react';
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
  initialVersion = '1.1.0'
}) => {
  const [currentVersion, setCurrentVersion] = useState<string>('1.0.0');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'>(initialStatus);
  const [targetVersion, setTargetVersion] = useState<string>(initialVersion);
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [checking, setChecking] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);

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

  const handleCheckForUpdates = async () => {
    if (isElectron && window.electronAPI) {
      setChecking(true);
      setStatus('checking');
      setErrorMessage('');
      try {
        const res = await window.electronAPI.checkForUpdates();
        if (!res.success && res.error) {
          setStatus('error');
          setErrorMessage(res.error);
          setChecking(false);
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'Unable to check for updates');
        setChecking(false);
      }
    } else {
      // Browser preview mode with smooth step progress animation
      setChecking(true);
      setStatus('checking');
      setTimeout(() => {
        setStatus('downloading');
        let p = 0;
        const interval = setInterval(() => {
          p += 20;
          setProgress(p);
          if (p >= 100) {
            clearInterval(interval);
            setStatus('downloaded');
            setChecking(false);
          }
        }, 250);
      }, 700);
    }
  };

  const handleRestartNow = () => {
    if (isElectron && window.electronAPI) {
      window.electronAPI.quitAndInstall();
    } else {
      alert('EMS Desktop will restart automatically and apply update v' + (targetVersion || '1.1.0'));
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Dynamic Scoped Keyframes */}
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
        @keyframes updaterBadgePulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(0, 128, 255, 0.4), 0 8px 20px rgba(0, 128, 255, 0.3);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(0, 128, 255, 0), 0 12px 28px rgba(0, 128, 255, 0.45);
            transform: scale(1.03);
          }
        }
        @keyframes updaterFloatGentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes updaterShine {
          0% { left: -100%; opacity: 0; }
          50% { opacity: 0.5; }
          100% { left: 200%; opacity: 0; }
        }
      `}</style>

      {/* Backdrop overlay with blur */}
      <div 
        onClick={handleClose}
        style={{
          animation: isClosing 
            ? 'updaterBackdropFadeOut 0.2s ease-out forwards' 
            : 'updaterBackdropFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60"
      >
        {/* Modal Window Container */}
        <div 
          onClick={e => e.stopPropagation()}
          style={{
            animation: isClosing 
              ? 'updaterModalPopOut 0.2s ease-in forwards' 
              : 'updaterModalPopIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
          className="bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 max-w-[440px] w-full overflow-hidden transition-all relative"
        >
          
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50/70 backdrop-blur-sm">
            <span className="text-xs font-semibold text-slate-700 tracking-wide flex items-center gap-2">
              <Sparkles size={14} className="text-sky-500 animate-spin" style={{ animationDuration: '6s' }} />
              Update Ready to Install
            </span>
            <button 
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors duration-150 active:scale-90"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 space-y-6">

            {/* When update downloaded / ready (Matches exact reference design with animations) */}
            {(status === 'downloaded' || status === 'idle' || !isElectron) && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  {/* Animated Information Badge Icon */}
                  <div className="relative shrink-0 mt-0.5">
                    <div 
                      style={{ animation: 'updaterBadgePulse 3s infinite cubic-bezier(0.4, 0, 0.6, 1)' }}
                      className="w-12 h-12 rounded-full bg-[#0080FF] text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30 transition-transform duration-300"
                    >
                      <div style={{ animation: 'updaterFloatGentle 3s ease-in-out infinite' }}>
                        <Info size={26} strokeWidth={2.2} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Headline & Description */}
                  <div className="space-y-1 pt-0.5">
                    <h3 className="text-[17px] font-medium text-[#0060C0] leading-snug tracking-tight">
                      EMS Desktop v{targetVersion || '1.1.0'} has been downloaded.
                    </h3>
                    <p className="text-[13px] text-slate-600 leading-relaxed font-normal">
                      Restart the application now to apply the update automatically.
                    </p>
                  </div>
                </div>

                {/* Action Buttons Stack */}
                <div className="space-y-2.5 pt-2">
                  {/* Primary "Restart Now" Button */}
                  <button
                    onClick={handleRestartNow}
                    className="relative overflow-hidden w-full flex items-center gap-3 px-4 py-3 bg-white border border-sky-300 hover:border-sky-400 hover:bg-sky-50/80 text-[#0060C0] font-medium text-sm rounded-xl transition-all duration-200 shadow-xs hover:shadow-md hover:shadow-sky-500/10 active:scale-[0.98] group"
                  >
                    {/* Animated Shine Sweep Effect */}
                    <div 
                      className="absolute top-0 bottom-0 w-16 bg-gradient-to-r from-transparent via-sky-200/40 to-transparent pointer-events-none"
                      style={{ animation: 'updaterShine 4s ease-in-out infinite' }}
                    />
                    <ArrowRight 
                      size={18} 
                      className="text-[#0060C0] group-hover:translate-x-1.5 transition-transform duration-200 ease-out shrink-0" 
                    />
                    <span className="tracking-tight font-medium">Restart Now</span>
                  </button>

                  {/* Secondary "Later" Button */}
                  <button
                    onClick={handleClose}
                    className="w-full flex items-center gap-3 px-4 py-2.5 bg-transparent hover:bg-slate-100/80 border border-transparent hover:border-slate-200 text-[#0060C0] font-medium text-sm rounded-xl transition-all duration-200 active:scale-[0.98] group"
                  >
                    <ArrowRight 
                      size={18} 
                      className="text-[#0060C0] group-hover:translate-x-1.5 transition-transform duration-200 ease-out shrink-0" 
                    />
                    <span className="tracking-tight font-medium">Later</span>
                  </button>
                </div>
              </div>
            )}

            {/* Checking State */}
            {status === 'checking' && (
              <div className="flex flex-col items-center justify-center py-6 space-y-3">
                <RefreshCw size={36} className="text-sky-600 animate-spin" />
                <p className="text-sm font-semibold text-slate-800">Checking for updates...</p>
                <p className="text-xs text-slate-500">Contacting update server</p>
              </div>
            )}

            {/* Downloading State with Animated Progress */}
            {status === 'downloading' && (
              <div className="space-y-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-sky-100/70 text-sky-600 rounded-xl animate-bounce">
                    <Download size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Downloading EMS Desktop v{targetVersion}...</h4>
                    <p className="text-xs text-slate-500">Please wait while the update files are transferred.</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span>Progress</span>
                    <span className="text-sky-600 font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60 relative">
                    <div 
                      className="bg-[#0080FF] h-full rounded-full transition-all duration-300 shadow-sm shadow-blue-500/40 relative overflow-hidden"
                      style={{ width: `${progress}%` }}
                    >
                      <div 
                        className="absolute top-0 bottom-0 left-0 right-0 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.4)_50%,rgba(255,255,255,0)_100%)] animate-pulse"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Up-to-date State */}
            {status === 'not-available' && (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">You are up to date!</h4>
                  <p className="text-xs text-slate-500 mt-1">EMS Desktop v{currentVersion} is currently the latest release.</p>
                </div>
                <button
                  onClick={handleClose}
                  className="mt-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            )}

            {/* Error State */}
            {status === 'error' && (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-md shadow-rose-500/20">
                  <AlertCircle size={28} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Update Check Failed</h4>
                  <p className="text-xs text-rose-600 mt-1">{errorMessage || 'Could not reach update server.'}</p>
                </div>
                <button
                  onClick={handleCheckForUpdates}
                  className="mt-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95"
                >
                  Try Again
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};
