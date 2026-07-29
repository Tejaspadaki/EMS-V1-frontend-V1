import React, { useState, useEffect } from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { socket } from '../../services/socket';

export const ConnectionStatusBanner: React.FC = () => {
  const [isDisconnected, setIsDisconnected] = useState(!socket.connected);

  useEffect(() => {
    const handleConnect = () => setIsDisconnected(false);
    const handleDisconnect = () => setIsDisconnected(true);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  if (!isDisconnected) return null;

  return (
    <div className="bg-amber-500 text-slate-950 font-semibold text-xs py-1.5 px-4 flex items-center justify-center gap-2 shadow-md animate-fade-in border-b border-amber-600/30">
      <WifiOff size={14} className="animate-pulse" />
      <span>Real-time connection dropped. Reconnecting to EMS server...</span>
      <AlertTriangle size={14} />
    </div>
  );
};
