import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface ErrorAlertProps {
  message: string;
  title?: string;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  message, 
  title = 'An error occurred',
  className = ''
}) => {
  return (
    <div className={`p-4 rounded-2xl border border-rose-100 bg-rose-50/50 backdrop-blur-sm text-rose-800 shadow-sm flex items-start gap-3 my-4 animate-fade-in ${className}`.trim()}>
      <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <h4 className="font-semibold text-sm text-rose-900 leading-tight">{title}</h4>}
        <p className="text-sm mt-1 text-rose-700/90 leading-relaxed font-medium">{message}</p>
      </div>
    </div>
  );
};

export default ErrorAlert;
