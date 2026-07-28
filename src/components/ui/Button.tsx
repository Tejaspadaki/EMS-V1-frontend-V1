import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' | 'outline';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-br from-slate-800 to-slate-700 text-white shadow-sm hover:shadow-md hover:shadow-slate-200/50 active:shadow-sm focus-visible:ring-slate-800',
  secondary: 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm hover:shadow-md hover:shadow-indigo-200/50 active:shadow-sm focus-visible:ring-indigo-500',
  accent: 'bg-gradient-to-br from-sky-500 to-indigo-500 text-white shadow-sm hover:shadow-md hover:shadow-indigo-200/50 active:shadow-sm focus-visible:ring-sky-500',
  ghost: 'bg-transparent text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 focus-visible:ring-slate-400',
  outline: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs focus-visible:ring-indigo-500',
  danger: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-sm hover:shadow-md hover:shadow-red-200/50 active:shadow-sm focus-visible:ring-red-500',
};

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  fullWidth = false, 
  size = 'md',
  isLoading = false,
  icon,
  className = '', 
  children, 
  disabled,
  ...props 
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
  };

  const baseClass = variantClasses[variant];
  const widthClass = fullWidth ? 'w-full justify-center' : '';
  const isDisabled = disabled || isLoading;
  
  return (
    <button 
      disabled={isDisabled}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${sizeClasses[size]} ${baseClass} ${widthClass} ${className}`.trim()} 
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};

