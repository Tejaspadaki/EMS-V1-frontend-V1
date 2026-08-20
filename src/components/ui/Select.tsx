import React, { forwardRef } from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`novynth-input ${error ? 'error' : ''} ${className}`.trim()}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';
