import React, { useEffect, useState } from 'react';
import { getSecurityDashboardData } from '../../api/dashboard.api';
import { unlockUser } from '../../api/admin.api';
import { KPICard } from '../../components/dashboard/KPICard';
import { ShieldCheck, Lock, AlertTriangle, ShieldAlert, Key, Terminal, ArrowRight, CheckCircle2, Shield, UserX, Activity, Unlock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { toast } from '../../utils/toast';

export const SecurityLeadDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lockedList, setLockedList] = useState<any[]>([]);
  const [unlockingId, setUnlockingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getSecurityDashboardData();
        setData(res);
        if (res?.lockedUsers) setLockedList(res.lockedUsers);
      } catch (err) {
        console.error('Error loading Security dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUnlockAccount = async (userId: number, email: string) => {
    try {
      setUnlockingId(userId);
      const res = await unlockUser(userId.toString());
      if (res.success) {
        setLockedList(prev => prev.filter(u => u.id !== userId));
        toast.success(`Account unlocked & reset: ${email}`);
      } else {
        toast.error(res.message || 'Failed to unlock account');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to unlock account');
    } finally {
      setUnlockingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  const { incidents, failedLoginFeed, vulnerabilities } = data || {};

  const securityTasks = [
    { id: 1, title: 'Annual Penetration Testing & OWASP Top 10 Audit', assignee: 'Marcus Vance', status: 'IN_PROGRESS' },
    { id: 2, title: 'Direct-Link URL Bypass Guard Verification', assignee: 'Elena Rostova', status: 'DONE' },
    { id: 3, title: 'JWT Token Expiry Throttling Review', assignee: 'Marcus Vance', status: 'IN_REVIEW' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Security Lead Watch-and-Check Dashboard</h1>
        <p className="text-slate-500">Failed login monitoring, account lockout management, RBAC audit feeds, vulnerabilities & incident responder</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard title="Security Posture Score" value="98/100" trend="Zero unpatched criticals" trendUp={true} icon={<ShieldCheck size={24} className="text-emerald-500" />} />
        <KPICard title="Locked Out Accounts" value={(lockedList.length || 1).toString()} trend="5 failed attempts trigger" trendUp={false} icon={<Lock size={24} className="text-rose-500" />} />
        <KPICard title="Failed Login Attempts (24h)" value={(failedLoginFeed?.length || 2).toString()} trend="IP auto-throttled" trendUp={true} icon={<Key size={24} className="text-amber-500" />} />
        <KPICard title="Vulnerability Audit" value={(vulnerabilities?.length || 2).toString()} trend="OWASP Top 10 Compliant" trendUp={true} icon={<Terminal size={24} className="text-indigo-500" />} />
      </div>

      {/* Account Lockout Manager & Failed Login Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Failed Login Attempts Feed */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Lock className="text-rose-500" size={20} /> Failed Login & Lockout Feed (5-Attempt Throttling)
          </h3>
          <div className="space-y-3">
            {(failedLoginFeed || []).map((feed: any) => (
              <div key={feed.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{feed.email}</h4>
                  <p className="text-[11px] text-slate-500">IP: {feed.ip} • {new Date(feed.timestamp).toLocaleTimeString()}</p>
                </div>
                <span className="text-[10px] font-extrabold uppercase bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full">
                  {feed.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Locked User Accounts & Unlock Action */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserX className="text-rose-600" size={20} />
                Locked Accounts Management
              </span>
              <span className="text-xs text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full font-bold">
                {lockedList.length} Accounts Locked
              </span>
            </h3>
            <div className="space-y-3">
              {lockedList.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">Zero accounts currently locked out.</div>
              ) : (
                lockedList.map((user: any) => (
                  <div key={user.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{user.name} ({user.email})</h4>
                      <p className="text-slate-400 text-[10px]">Locked: {new Date(user.locked_at || Date.now()).toLocaleTimeString()}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={unlockingId === user.id}
                      onClick={() => handleUnlockAccount(user.id, user.email)}
                      className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-bold"
                    >
                      {unlockingId === user.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-1" />
                      ) : (
                        <Unlock size={13} className="mr-1 text-emerald-600" />
                      )}
                      Unlock & Reset
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Engineers Kanban & Vulnerabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Task Board */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="text-indigo-600" size={20} />
            Security Engineers Task Kanban
          </h3>
          <div className="space-y-3">
            {securityTasks.map(t => (
              <div key={t.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{t.title}</h4>
                  <p className="text-slate-500">Assignee: {t.assignee}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  t.status === 'DONE' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {t.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Vulnerability & Compliance Status */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ShieldAlert className="text-amber-500" size={20} /> Vulnerability Tracker & Direct-Link Audit
          </h3>
          <div className="space-y-3">
            {(vulnerabilities || []).map((v: any) => (
              <div key={v.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{v.title}</h4>
                  <p className="text-[11px] text-slate-500">Severity: {v.severity}</p>
                </div>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

