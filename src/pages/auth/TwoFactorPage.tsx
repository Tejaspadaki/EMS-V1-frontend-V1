import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { OtpInput } from '../../components/auth/OtpInput';
import { verify2FA, resendOTP } from '../../api/auth.api';
import { useAuthStore, getRoleDashboardRoute, normalizeRole } from '../../store/authStore';
import { Shield, ArrowLeft, RefreshCw, Smartphone, Mail } from 'lucide-react';

export const TwoFactorPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginSuccess, accessToken, isTwoFactorRequired, isAuthenticated, devOtp } = useAuthStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'email' | 'app'>('email');
  const [resendTimer, setResendTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(true);

  useEffect(() => {
    if (!isTwoFactorRequired && !isAuthenticated) {
      navigate('/login');
    }
  }, [isTwoFactorRequired, isAuthenticated, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, resendTimer]);

  if (!isTwoFactorRequired && !isAuthenticated) {
    return null;
  }

  const handleVerify = async (codeToVerify: string) => {
    if (codeToVerify.length !== 6) return;
    setError('');
    setLoading(true);

    try {
      const response = await verify2FA(codeToVerify);
      loginSuccess(response.token || accessToken || '', response.user);
      navigate(getRoleDashboardRoute(normalizeRole(response.user.role)));
    } catch (err: any) {
      console.error('2FA verification error:', err);
      const backendMessage = err.response?.data?.error?.message || err.response?.data?.message;
      setError(backendMessage || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(code);
  };

  const handleResend = async () => {
    if (isTimerActive) return;
    setError('');
    try {
      await resendOTP();
      setResendTimer(30);
      setIsTimerActive(true);
    } catch (err) {
      setError('Failed to resend OTP.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090D16] text-white relative overflow-hidden p-4 sm:p-6">
      {/* Ambient background glowing accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in relative z-10">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors font-medium group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to login
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/25 mb-5 ring-1 ring-white/20">
            <Shield className="text-white" size={28} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Two-Factor Auth</h1>
          <p className="text-slate-400 mt-2 text-sm font-normal leading-relaxed">
            {method === 'email'
              ? 'Enter the 6-digit code sent to your email.'
              : 'Enter the 6-digit code from your authenticator app.'}
          </p>
        </div>

        <div className="bg-[#111726]/90 rounded-3xl border border-slate-800/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {devOtp && (
            <div className="mb-5 p-3.5 rounded-2xl border border-amber-500/30 bg-amber-950/30 text-amber-200">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1 text-center">
                Dev Mode OTP
              </p>
              <p className="text-2xl font-mono font-bold tracking-[0.4em] text-amber-300 text-center">
                {devOtp}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
                {error}
              </div>
            )}

            <div>
              <OtpInput
                length={6}
                value={code}
                onChange={setCode}
                onComplete={handleVerify}
                disabled={loading}
                hasError={Boolean(error)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className={`
                w-full py-3.5 px-6 rounded-full font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg
                ${code.length === 6 && !loading
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                  : 'bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed shadow-none'
                }
              `.trim()}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw size={18} className="animate-spin" /> Verifying...
                </span>
              ) : (
                'Verify Code'
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3.5 text-sm">
            {isTimerActive ? (
              <div className="text-slate-400 text-sm font-medium flex items-center gap-1.5">
                <span>Resend in {formatTime(resendTimer)}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="flex items-center gap-1.5 font-semibold text-sm bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer"
              >
                <RefreshCw size={14} className={`text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
                Resend OTP
              </button>
            )}

            <button
              type="button"
              onClick={() => setMethod(method === 'email' ? 'app' : 'email')}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors text-xs font-medium mt-1"
            >
              {method === 'email' ? <Smartphone size={14} /> : <Mail size={14} />}
              {method === 'email' ? 'Use Authenticator App' : 'Use Email OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
