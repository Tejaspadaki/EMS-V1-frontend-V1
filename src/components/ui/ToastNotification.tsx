import React from 'react';
import { useToastStore } from '../../store/toastStore';
import { Bell, Info, AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();
  const navigate = useNavigate();

  const getIcon = (type?: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-emerald-500" size={24} />;
      case 'error': return <XCircle className="text-red-500" size={24} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={24} />;
      case 'info':
      case 'System':
      default: return <Info className="text-indigo-500" size={24} />;
    }
  };

  const getBgColor = (type?: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'info':
      case 'System':
      default: return 'bg-indigo-50 border-indigo-200';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border ${getBgColor(toast.type)} animate-in slide-in-from-right-8 duration-300`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(toast.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-800">{toast.title}</h4>
            <p className="text-sm text-slate-600 mt-1 line-clamp-2">{toast.message}</p>
            {toast.link && (
              <button 
                onClick={() => navigate(toast.link!)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-2 hover:underline"
              >
                View Details &rarr;
              </button>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
