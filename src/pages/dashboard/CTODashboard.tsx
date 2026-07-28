import React, { useEffect, useState } from 'react';
import { getCTODashboardData } from '../../api/engineering.api';
import { getCEODashboardData } from '../../api/ceo.api';
import { KPICard } from '../../components/dashboard/KPICard';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Server, Activity, Clock, Terminal, GitMerge, CheckCircle, XCircle, Cpu, HardDrive, ShieldAlert, Code2, DollarSign, ArrowRight, Eye, Plus, AlertCircle, FileCheck, Layers } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { toast } from '../../utils/toast';
import { useNavigate } from 'react-router-dom';

export const CTODashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [ceoData, setCeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [engRes, ceoRes] = await Promise.all([
        getCTODashboardData().catch(() => null),
        getCEODashboardData().catch(() => null)
      ]);
      if (engRes) setData(engRes);
      if (ceoRes) setCeoData(ceoRes);
    } catch (err) {
      console.error('Error fetching CTO dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500 font-medium">Loading Engineering & Tech Dashboard...</span>
        </div>
      </div>
    );
  }

  const { metrics, charts, recentDeployments } = data || {};
  const ceoMetrics = ceoData?.metrics || {};

  const techProjects = [
    { id: 1, name: 'EMS Core Infrastructure Upgrade', stage: 'Development', progress: 78, team_size: 6, status: 'On Track', linkedQuotation: 'Q-2026-08', scopeDrift: false },
    { id: 2, name: 'AI Face Recognition Engine v2', stage: 'Testing', progress: 92, team_size: 4, status: 'At Risk', linkedQuotation: 'Q-2026-12', scopeDrift: true },
    { id: 3, name: 'LiveKit Real-Time WebRTC Bridge', stage: 'Deployment', progress: 95, team_size: 3, status: 'On Track', linkedQuotation: 'Q-2026-15', scopeDrift: false },
    { id: 4, name: 'OAuth2 / 2FA Multi-Tenant Hardening', stage: 'Planning', progress: 25, team_size: 2, status: 'On Track', linkedQuotation: 'Q-2026-19', scopeDrift: false }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">CTO Technical Hub</h1>
          <p className="text-slate-500">Engineering portfolio, tech performance, node telemetry & shared revenue overview</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" icon={<Eye size={16} />} onClick={() => navigate('/admin/role-cards')}>
            Role Cards Directory
          </Button>
          <Button variant="outline" icon={<Plus size={16} />} onClick={() => navigate('/quotations')}>
            Generate Quotation
          </Button>
          <Button variant="primary" icon={<Activity size={16} />} onClick={() => toast.info('Live APM telemetry synced.')}>
            APM Telemetry
          </Button>
        </div>
      </div>

      {/* Shared Business & Revenue Analytics Bar (CTO & CEO) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-widest">
              <DollarSign size={16} className="text-emerald-400" />
              Shared Company Revenue Analytics (CEO & CTO)
            </div>
            <p className="text-slate-300 text-xs font-medium">
              Total Revenue: <strong className="text-emerald-400">${(ceoMetrics.revenue || 1250000).toLocaleString()}</strong> • Monthly Revenue: <strong className="text-white">${(ceoMetrics.monthlyRevenue || 145000).toLocaleString()}</strong> • Net Margin: <strong className="text-emerald-400">{ceoMetrics.profitMargin || 66.4}%</strong>
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-right shrink-0">
            <p className="text-[10px] text-slate-300 font-bold uppercase">Business Health</p>
            <p className="text-xl font-extrabold text-white">{ceoMetrics.businessHealthScore || 88}/100</p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="System Uptime" 
          value={`${metrics?.uptime || 99.98}%`}
          trend="All node services healthy"
          trendUp={true}
          icon={<Server size={24} className="text-emerald-500" />}
        />
        <KPICard 
          title="Active PRs (30d)" 
          value={metrics?.activePRs?.toString() || '18'}
          trend={`${metrics?.mergedPRs || 14} Merged`}
          trendUp={true}
          icon={<GitMerge size={24} className="text-indigo-500" />}
        />
        <KPICard 
          title="Cross-Team Overdue Tasks" 
          value="3"
          trend="Eng / AI / Security tasks"
          trendUp={false}
          icon={<ShieldAlert size={24} className="text-rose-500" />}
        />
        <KPICard 
          title="MTTR Threshold" 
          value={`${metrics?.mttr || 28} min`}
          trend="Auto-recovery active"
          trendUp={true}
          icon={<Clock size={24} className="text-amber-500" />}
        />
      </div>

      {/* Technical Project Portfolio (5-Stage Taxonomy) & Scope Drift */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="text-sky-600" size={20} />
              Engineering & AI Project Portfolio (5-Stage Taxonomy)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Planning → Development → Testing → Deployment → Closed</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
            View All Projects
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 font-bold uppercase text-[10px] tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Project Name</th>
                <th className="p-3.5">Stage</th>
                <th className="p-3.5">Progress %</th>
                <th className="p-3.5">Team Size</th>
                <th className="p-3.5">Quotation Ref</th>
                <th className="p-3.5">Scope Status</th>
                <th className="p-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {techProjects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-all">
                  <td className="p-3.5 font-bold text-slate-900">{p.name}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full text-[10px] uppercase">
                      {p.stage}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">{p.progress}%</td>
                  <td className="p-3.5 font-semibold text-slate-600">{p.team_size} Devs</td>
                  <td className="p-3.5 font-mono text-indigo-600 font-bold">{p.linkedQuotation}</td>
                  <td className="p-3.5">
                    {p.scopeDrift ? (
                      <span className="font-bold bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-[10px] uppercase flex items-center gap-1 w-max">
                        <AlertCircle size={12} /> Scope Drift
                      </span>
                    ) : (
                      <span className="font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] uppercase w-max inline-block">
                        Aligned
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <button onClick={() => navigate(`/projects/${p.id}`)} className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1">
                      Kanban <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Resource Utilization & Deployments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Infrastructure Usage Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Server className="text-slate-400" size={20} /> Hardware Resource Utilization
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.cpuMemoryUsage || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} tickFormatter={(value) => `${value}%`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="cpu" name="CPU Load %" stroke="#0284C7" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="memory" name="Memory Usage %" stroke="#8B5CF6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Deployments */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            Recent CI/CD Deployments
          </h3>
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[280px] custom-scrollbar">
            {(!recentDeployments?.length ? [
              { id: 1, project_name: 'EMS Backend API', version: 'v2.6.4', status: 'success', environment: 'production' },
              { id: 2, project_name: 'AI Model Service', version: 'v1.4.0', status: 'success', environment: 'staging' },
              { id: 3, project_name: 'WebRTC Signal Node', version: 'v3.1.2', status: 'success', environment: 'production' }
            ] : recentDeployments).map((deploy: any) => (
              <div key={deploy.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle className="text-emerald-500" size={14} />
                    {deploy.project_name}
                  </h4>
                  <p className="text-slate-400 mt-0.5">Env: {deploy.environment}</p>
                </div>
                <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {deploy.version}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
