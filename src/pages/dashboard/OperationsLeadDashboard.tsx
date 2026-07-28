import React, { useEffect, useState } from 'react';
import { getOpsDashboardData, createSOP, logRisk, logIncident, registerTool, submitImprovement } from '../../api/dashboard.api';
import { KPICard } from '../../components/dashboard/KPICard';
import { 
  Building2, Users, FileText, Calendar, AlertTriangle, ShieldAlert, 
  Wrench, Lightbulb, CheckCircle2, Clock, Activity, AlertCircle, ArrowUpRight, Plus, RefreshCw, Eye 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { toast } from '../../utils/toast';
import { useNavigate } from 'react-router-dom';

export const OperationsLeadDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sopsList, setSopsList] = useState<any[]>([
    { id: 1, title: 'Engineering Incident Response SOP', ref_number: 'SOP-ENG-001', version: 'v2.1', category: 'Engineering', review_date: '2026-03-15', stale: false },
    { id: 2, title: 'Employee Offboarding Checklist SOP', ref_number: 'SOP-HR-004', version: 'v1.3', category: 'HR', review_date: '2026-01-10', stale: true },
    { id: 3, title: 'Client Onboarding & Contract SOP', ref_number: 'SOP-OPS-009', version: 'v3.0', category: 'Operations', review_date: '2026-05-20', stale: false }
  ]);
  const [showSopModal, setShowSopModal] = useState(false);
  const [newSopTitle, setNewSopTitle] = useState('');
  const [newSopCat, setNewSopCat] = useState('Operations');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getOpsDashboardData();
        setData(res);
        if (res?.sops && res.sops.length > 0) setSopsList(res.sops);
      } catch (err) {
        console.error('Error loading Operations dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateSop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSopTitle.trim()) return;
    try {
      const created = await createSOP({ title: newSopTitle, category: newSopCat });
      setSopsList([created, ...sopsList]);
      setNewSopTitle('');
      setShowSopModal(false);
      toast.success(`Created new SOP: ${created.ref_number || created.title}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create SOP');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500 font-medium">Loading Operations Hub...</span>
        </div>
      </div>
    );
  }

  const { headcountPlan, sops, risks, incidents, tools, improvements } = data || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Operations Lead Hub</h1>
          <p className="text-slate-500">Org chart structure, SOP library, meetings, risks, SaaS tools & process improvements</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" icon={<Eye size={16} />} onClick={() => navigate('/users')}>
            Org Structure Directory
          </Button>
          <Button variant="outline" icon={<Plus size={16} />} onClick={() => setShowSopModal(true)}>
            + New SOP
          </Button>
          <Button variant="primary" icon={<AlertTriangle size={16} />} onClick={() => toast.info('Log Incident modal opened')}>
            Log Incident / Risk
          </Button>
        </div>
      </div>

      {/* Create SOP Modal */}
      {showSopModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create Standard Operating Procedure (SOP)</h3>
            <form onSubmit={handleCreateSop} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">SOP Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Production Release Approval SOP"
                  value={newSopTitle}
                  onChange={(e) => setNewSopTitle(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Category Department</label>
                <select 
                  value={newSopCat}
                  onChange={(e) => setNewSopCat(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Operations">Operations</option>
                  <option value="Engineering">Engineering</option>
                  <option value="HR">HR</option>
                  <option value="Growth">Growth</option>
                  <option value="Security">Security</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowSopModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm">Save SOP</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Org Structure & Span of Control Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-widest">
              <Building2 size={16} />
              Live Org Structure & Span-of-Control Monitor
            </div>
            <p className="text-slate-200 text-sm max-w-2xl font-medium">
              Live workforce: <strong>{headcountPlan?.current || 32} active team members</strong>. Next quarter target: <strong>{headcountPlan?.nextQuarterTarget || 37}</strong>.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15">
            <AlertCircle className="text-amber-400 shrink-0" size={24} />
            <div>
              <p className="text-[10px] text-indigo-300 font-bold uppercase">Span-of-Control Warning</p>
              <p className="text-lg font-bold text-white">1 Manager (&gt;7 Direct Reports)</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard title="Total Active SOPs" value={(sopsList.length).toString()} trend="1 SOP due for review" trendUp={true} icon={<FileText size={24} className="text-indigo-500" />} />
        <KPICard title="Active Risks Logged" value={(risks?.length || 4).toString()} trend="1 High Severity" trendUp={false} icon={<AlertTriangle size={24} className="text-amber-500" />} />
        <KPICard title="Open Incidents" value={(incidents?.length || 2).toString()} trend="Sev1 Auto-notified CEO" trendUp={true} icon={<ShieldAlert size={24} className="text-rose-500" />} />
        <KPICard title="SaaS Tools Spend" value="$4,200/mo" trend="15 Registered Systems" trendUp={true} icon={<Wrench size={24} className="text-emerald-500" />} />
      </div>

      {/* Grid: Risks & Incidents | SOPs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Log & Incident Severity */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={20} />
                Risk & Incident Handling (Sev1 / Sev2 Alerts)
              </span>
              <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full">
                {risks?.length || 2} Risks Logged
              </span>
            </h3>
            <div className="space-y-3">
              {(risks?.length ? risks : [
                { id: 1, title: 'AWS Cloud Server Backup Delay', severity: 'High', status: 'Open', mitigation: 'Automated nightly snapshot script setup' },
                { id: 2, title: 'Single Point of Failure in Production Deployment', severity: 'Medium', status: 'Mitigated', mitigation: 'Cross-trained backup lead assigned' }
              ]).map((rk: any) => (
                <div key={rk.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      {rk.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">Mitigation: {rk.mitigation}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                    rk.severity === 'High' || rk.severity === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {rk.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SOP Library & Review Dates */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="text-indigo-600" size={20} />
                SOP Library & Review Schedule
              </span>
              <span className="text-xs text-slate-400 font-medium">Review &lt; 6 months staleness check</span>
            </h3>
            <div className="space-y-3">
              {sopsList.map((sop: any) => (
                <div key={sop.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{sop.ref_number}</span>
                      <span className="text-[10px] font-bold text-slate-500">{sop.category}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mt-1">{sop.title}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-semibold block">{sop.version}</span>
                    {sop.stale && <span className="text-[9px] font-bold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded mt-1 inline-block">Review Due</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Tool Registry & Process Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool Registry */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Wrench className="text-emerald-600" size={20} />
            SaaS Tools Registry & Spend
          </h3>
          <div className="space-y-3">
            {(tools?.length ? tools : [
              { id: 1, name: 'GitHub Enterprise', purpose: 'Code Repo & CI/CD', monthly_cost: '850.00', status: 'Active' },
              { id: 2, name: 'Figma Pro', purpose: 'UI/UX Design Mockups', monthly_cost: '240.00', status: 'Active' },
              { id: 3, name: 'Slack Business', purpose: 'Internal Communication', monthly_cost: '450.00', status: 'Active' }
            ]).map((t: any) => (
              <div key={t.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                  <p className="text-xs text-slate-500">{t.purpose}</p>
                </div>
                <span className="text-xs font-bold text-slate-900">${t.monthly_cost}/mo</span>
              </div>
            ))}
          </div>
        </div>

        {/* Process Improvements */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Lightbulb className="text-amber-500" size={20} />
            Process Improvement (Kaizen) Submissions
          </h3>
          <div className="space-y-3">
            {(improvements?.length ? improvements : [
              { id: 1, title: 'Automate Weekly Standup Summaries via Bot', impact_tier: 'Quick Win', status: 'Under Review' },
              { id: 2, title: 'Single Sign-On (SSO) Integration across tools', impact_tier: 'Big Project', status: 'Accepted' }
            ]).map((imp: any) => (
              <div key={imp.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{imp.title}</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{imp.impact_tier}</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{imp.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

