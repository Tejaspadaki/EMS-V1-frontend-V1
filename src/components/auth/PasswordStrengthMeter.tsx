import React from 'react';
import { Check, ShieldAlert, ShieldCheck } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  confirmPassword?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  confirmPassword,
}) => {
  const criteria = [
    { label: 'At least 8 characters long', met: password.length >= 8 },
    { label: 'Includes uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Includes lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'Includes a number (0-9)', met: /[0-9]/.test(password) },
    { label: 'Includes a special symbol (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const metCount = criteria.filter((c) => c.met).length;
  const percentage = (metCount / criteria.length) * 100;

  const getStrengthMeta = () => {
    if (metCount === 0) return { label: 'Very Weak', color: 'bg-slate-300', text: 'text-slate-400' };
    if (metCount <= 2) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-600' };
    if (metCount === 3) return { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' };
    if (metCount === 4) return { label: 'Good', color: 'bg-indigo-500', text: 'text-indigo-600' };
    return { label: 'Strong & Robust', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const strengthMeta = getStrengthMeta();
  const showMatchStatus = confirmPassword !== undefined && confirmPassword.length > 0;
  const isMatch = password && confirmPassword === password;

  return (
    <div className="space-y-3 mt-2 text-xs">
      {/* Strength Bar */}
      {password.length > 0 && (
        <div className="space-y-1.5 animate-fade-in">
          <div className="flex items-center justify-between font-medium">
            <span className="text-slate-500">Password Strength:</span>
            <span className={`font-semibold ${strengthMeta.text}`}>{strengthMeta.label}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${strengthMeta.color}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Criteria Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
        {criteria.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 transition-colors">
            {item.met ? (
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Check size={10} strokeWidth={3} />
              </div>
            ) : (
              <div className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                <div className="w-1 h-1 rounded-full bg-slate-400" />
              </div>
            )}
            <span className={item.met ? 'text-slate-700 font-medium' : 'text-slate-400'}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Confirm Password Match Banner */}
      {showMatchStatus && (
        <div className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium transition-all ${
          isMatch 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {isMatch ? (
            <>
              <ShieldCheck size={16} className="shrink-0 text-emerald-500" />
              <span>Passwords match</span>
            </>
          ) : (
            <>
              <ShieldAlert size={16} className="shrink-0 text-red-500" />
              <span>Passwords do not match</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
