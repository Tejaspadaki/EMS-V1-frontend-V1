import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Lock, AlertTriangle, Mail } from 'lucide-react';

export const AccountLockedPage: React.FC = () => {
  const { isLockedOut } = useAuthStore();

  if (!isLockedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500">
            No active lockout.{' '}
            <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium underline">
              Return to Login
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-200 mb-6">
          <Lock className="text-white w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Account Locked</h1>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card mb-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-slate-600 leading-relaxed text-left">
              Due to multiple failed login attempts or a security policy violation, your account has been temporarily locked to protect your data.
            </p>
          </div>

          <div className="bg-red-50 rounded-xl border border-red-100 p-4 text-left">
            <h3 className="text-sm font-semibold text-red-800 mb-1">What to do next?</h3>
            <p className="text-sm text-red-600">Contact your Super Admin to regain access to your account.</p>
          </div>
        </div>

        <button
          className="inline-flex items-center gap-2 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-red-200 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
          onClick={() => (window.location.href = 'mailto:superadmin@company.com')}
        >
          <Mail size={18} />
          Contact Super Admin
        </button>

        <p className="mt-6 text-xs text-slate-400 font-mono">
          Error Code: SEC_LOCK_01
        </p>
      </div>
    </div>
  );
};
