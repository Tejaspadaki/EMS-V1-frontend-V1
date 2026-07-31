import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (!value && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const rawVal = e.target.value;
    const sanitizedDigits = rawVal.replace(/\D/g, '');

    if (!sanitizedDigits) {
      const newDigits = [...digits];
      newDigits[index] = '';
      const newCode = newDigits.join('');
      onChange(newCode);
      return;
    }

    if (sanitizedDigits.length === 1) {
      const newDigits = [...digits];
      newDigits[index] = sanitizedDigits;
      const newCode = newDigits.join('');
      onChange(newCode);

      if (index < length - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }

      if (newCode.length === length && onComplete) {
        onComplete(newCode);
      }
    } else {
      handlePasteString(sanitizedDigits);
    }
  };

  const handlePasteString = (pastedText: string) => {
    const cleanDigits = pastedText.replace(/\D/g, '').slice(0, length);
    if (!cleanDigits) return;

    const newDigits = cleanDigits.split('');
    while (newDigits.length < length) {
      newDigits.push('');
    }

    const newCode = newDigits.join('');
    onChange(newCode);

    const targetFocusIndex = Math.min(cleanDigits.length, length - 1);
    if (inputRefs.current[targetFocusIndex]) {
      inputRefs.current[targetFocusIndex]?.focus();
    }

    if (cleanDigits.length === length && onComplete) {
      onComplete(cleanDigits);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    handlePasteString(pastedData);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0 && inputRefs.current[index - 1]) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        const newCode = newDigits.join('');
        onChange(newCode);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-2.5 my-2" role="group" aria-label="OTP Security Code Input">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={digits[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${length}`}
          className={`
            w-11 h-13 sm:w-12 sm:h-14 text-center font-mono font-bold text-2xl rounded-2xl border transition-all duration-200 outline-none
            ${hasError 
              ? 'border-red-500/80 bg-red-950/20 text-red-300 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
              : digits[index]
                ? 'border-indigo-500/80 bg-[#1C2438] text-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/50 focus:shadow-[0_0_20px_rgba(99,102,241,0.45)]'
                : 'border-slate-700/70 bg-[#141A28] text-white hover:border-slate-600 focus:border-indigo-500 focus:bg-[#1C2438] focus:ring-2 focus:ring-indigo-500/50 focus:shadow-[0_0_20px_rgba(99,102,241,0.45)]'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `.trim()}
        />
      ))}
    </div>
  );
};
