import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

const toastStyles = {
  success: {
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-800',
    icon: <CheckCircle size={18} className="text-emerald-500 shrink-0" />,
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    icon: <AlertCircle size={18} className="text-red-500 shrink-0" />,
  },
  info: {
    bg: 'bg-indigo-50 border-indigo-200',
    text: 'text-indigo-800',
    icon: <Info size={18} className="text-indigo-500 shrink-0" />,
  },
};

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const style = toastStyles[type];

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-dropdown ${style.bg} ${style.text} animate-fade-in`}>
      {style.icon}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={() => { setVisible(false); onClose?.(); }} className="ml-2 p-0.5 rounded-md hover:bg-black/5 transition-colors">
        <X size={14} />
      </button>
    </div>
  );
};
