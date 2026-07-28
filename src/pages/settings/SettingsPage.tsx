import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { changePassword } from '../../api/auth.api';
import { Lock, User, Shield, Bell, Moon, KeyRound, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await changePassword(newPassword);
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error?.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { icon: <Lock size={18} />, label: 'Security', active: true },
    { icon: <User size={18} />, label: 'Profile Details', disabled: true },
    { icon: <Bell size={18} />, label: 'Notifications', disabled: true },
    { icon: <Moon size={18} />, label: 'Appearance', disabled: true },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              disabled={item.disabled}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                item.active
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                  : 'text-slate-500 hover:bg-slate-50 cursor-not-allowed opacity-50'
              }`}
            >
              <span className={item.active ? 'text-indigo-600' : ''}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-5">
          <Card hover={false}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-indigo-50">
                  <Shield className="text-indigo-600" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Change Password</h2>
                  <p className="text-sm text-slate-500">Ensure your account is using a strong password.</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                {message.text && (
                  <div className={`p-3.5 rounded-xl text-sm flex items-center gap-2.5 ${
                    message.type === 'error' 
                      ? 'bg-red-50 border border-red-100 text-red-700' 
                      : 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                  }`}>
                    {message.type === 'success' ? <CheckCircle size={16} /> : null}
                    {message.text}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                  <input
                    type="password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                  />
                </div>
                
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || !newPassword || !confirmPassword}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card hover={false}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-sky-50">
                  <KeyRound className="text-sky-600" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Connected Accounts</h2>
                  <p className="text-sm text-slate-500">Manage your single sign-on connections.</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                    G
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-900">Google Single Sign-On</p>
                    <p className="text-xs text-slate-500 mt-0.5">Connected as {user?.email}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100">Active</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};