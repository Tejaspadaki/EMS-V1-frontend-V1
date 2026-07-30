import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | boolean;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, helperText, id, value, ...props }, ref) => {
    const inputId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const hasError = Boolean(error);
    const errorMessage = typeof error === 'string' ? error : undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          id={inputId}
          ref={ref}
          value={value}
          aria-invalid={hasError}
          className={`
            w-full text-sm rounded-xl border font-medium transition-all duration-200 outline-none
            p-3.5 bg-slate-50/50 text-slate-900 placeholder:text-slate-400
            ${hasError 
              ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
              : 'border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100'
            }
            ${className}
          `.trim()}
          {...props}
        />

        {errorMessage && (
          <p className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
            <AlertCircle size={12} className="shrink-0" />
            <span>{errorMessage}</span>
          </p>
        )}

        {!errorMessage && helperText && (
          <p className="text-xs text-slate-500 font-normal mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
