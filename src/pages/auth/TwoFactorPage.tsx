import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
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

  React.useEffect(() => {
    if (!isTwoFactorRequired && !isAuthenticated) {
      navigate('/login');
    }
  }, [isTwoFactorRequired, isAuthenticated, navigate]);

  if (!isTwoFactorRequired && !isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await verify2FA(code);
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

  const handleResend = async () => {
    try {
      await resendOTP();
    } catch (err) {
      setError('Failed to resend OTP.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to login
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200 mb-5">
            <Shield className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Two-Factor Auth</h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            {method === 'email' 
              ? 'Enter the 6-digit code sent to your email.'
              : 'Enter the 6-digit code from your authenticator app.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
          {devOtp && (
            <div className="mb-4 p-3 rounded-xl border border-amber-200 bg-amber-50">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1 text-center">Dev Mode OTP</p>
              <p className="text-2xl font-mono font-bold tracking-[0.4em] text-amber-900 text-center">{devOtp}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}
            
            <div>
              <Input 
                type="text" 
                required 
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center tracking-[0.3em] text-lg font-mono h-12"
              />
            </div>

            <Button type="submit" variant="primary" fullWidth disabled={loading || code.length !== 6} size="lg">
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>
          </form>

          <div className="mt-5 flex flex-col items-center gap-3 text-sm">
            <button 
              onClick={handleResend}
              className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              <RefreshCw size={14} />
              Resend OTP
            </button>
            
            <button 
              onClick={() => setMethod(method === 'email' ? 'app' : 'email')} 
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors"
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
