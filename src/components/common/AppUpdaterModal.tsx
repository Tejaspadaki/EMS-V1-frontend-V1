import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, CheckCircle2, AlertCircle, Sparkles, X, ArrowUpCircle } from 'lucide-react';
import type { UpdaterStatusData, UpdaterProgressData } from '../../electron-api';

interface AppUpdaterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppUpdaterModal: React.FC<AppUpdaterModalProps> = ({ isOpen, onClose }) => {
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'>('idle');
  const [targetVersion, setTargetVersion] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [checking, setChecking] = useState<boolean>(false);

  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

  useEffect(() => {
    if (!isElectron || !window.electronAPI) return;

    // Fetch running version
    window.electronAPI.getAppVersion().then(ver => {
      if (ver) setCurrentVersion(ver);
    }).catch(() => {});

    // Listen to status updates
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

    // Listen to download progress
    const removeProgressListener = window.electronAPI.onUpdaterProgress((data: UpdaterProgressData) => {
      setStatus('downloading');
      setProgress(data.percent || 0);
    });

    return () => {
      if (typeof removeStatusListener === 'function') removeStatusListener();
      if (typeof removeProgressListener === 'function') removeProgressListener();
    };
  }, [isElectron]);

  const handleCheckForUpdates = async () => {
    if (!isElectron || !window.electronAPI) return;
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
  };

  const handleUpdateAndRestart = () => {
    if (!isElectron || !window.electronAPI) return;
    window.electronAPI.quitAndInstall();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden transition-all transform animate-scale-in">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md">
              <Sparkles size={24} className="text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">EMS Application Updates</h3>
              <p className="text-xs text-indigo-100 mt-0.5">
                Current Version: <span className="font-semibold bg-white/20 px-2 py-0.5 rounded-full">v{currentVersion || '1.0.1'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {!isElectron && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2.5">
              <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold">Web Browser Detected</p>
                <p className="mt-0.5 text-amber-700">Desktop updates are only available when running inside the EMS Desktop application.</p>
              </div>
            </div>
          )}

          {isElectron && (
            <>
              {/* Status Display */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
                {status === 'idle' && (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800">Check for App Updates</p>
                    <p className="text-xs text-slate-500">Click below to check if a new version is available on the server.</p>
                  </div>
                )}

                {status === 'checking' && (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <RefreshCw size={24} className="text-indigo-600 animate-spin" />
                    <p className="text-sm font-medium text-slate-700">Checking for updates...</p>
                  </div>
                )}

                {status === 'not-available' && (
                  <div className="flex flex-col items-center gap-2 py-1">
                    <CheckCircle2 size={28} className="text-emerald-500" />
                    <p className="text-sm font-semibold text-slate-800">You are up to date!</p>
                    <p className="text-xs text-slate-500">EMS Desktop v{currentVersion} is the latest version.</p>
                  </div>
                )}

                {status === 'available' && (
                  <div className="flex flex-col items-center gap-2 py-1">
                    <ArrowUpCircle size={28} className="text-indigo-600 animate-bounce" />
                    <p className="text-sm font-semibold text-slate-800">New Update v{targetVersion} Available!</p>
                    <p className="text-xs text-slate-500">Downloading update automatically in background...</p>
                  </div>
                )}

                {status === 'downloading' && (
                  <div className="space-y-2 py-1">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                      <span>Downloading Update v{targetVersion}...</span>
                      <span className="text-indigo-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {status === 'downloaded' && (
                  <div className="flex flex-col items-center gap-2 py-1">
                    <Sparkles size={28} className="text-purple-600" />
                    <p className="text-sm font-bold text-slate-900">Version v{targetVersion} Ready to Install!</p>
                    <p className="text-xs text-slate-500">The update has been downloaded. Restart the app now to apply changes.</p>
                  </div>
                )}

                {status === 'error' && (
                  <div className="flex flex-col items-center gap-1 py-1 text-red-600">
                    <AlertCircle size={24} />
                    <p className="text-xs font-medium">{errorMessage || 'Could not connect to update server'}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                {status === 'downloaded' ? (
                  <button
                    onClick={handleUpdateAndRestart}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-95"
                  >
                    <RefreshCw size={18} className="animate-spin" />
                    Update & Restart Application
                  </button>
                ) : (
                  <button
                    onClick={handleCheckForUpdates}
                    disabled={checking || status === 'downloading'}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all duration-200"
                  >
                    <Download size={16} />
                    {checking ? 'Checking...' : 'Check for Updates'}
                  </button>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
