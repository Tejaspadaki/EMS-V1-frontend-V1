import React, { useEffect, useState } from 'react';
import { getEngLeadDashboardData } from '../../api/dashboard.api';
import { KPICard } from '../../components/dashboard/KPICard';
import { Code2, GitPullRequest, Clock, AlertCircle, ArrowRight, Users, FileCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { toast } from '../../utils/toast';
import { useNavigate } from 'react-router-dom';

export const EngineeringLeadDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getEngLeadDashboardData();
        setData(res);
      } catch (err) {
        console.error('Error loading Engineering Lead dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
      </div>
    );
  }

  const { projects, tasks, sprintBurnDown } = data || {};

  const engTeam = [
    { id: 1, name: 'David Kim', role: 'Full Stack Engineer', completed: 18, pending: 2, overdue: 0 },
    { id: 2, name: 'Sarah Jenkins', role: 'Backend Lead', completed: 22, pending: 4, overdue: 1 },
    { id: 3, name: 'Arjun Rao', role: 'Frontend Engineer', completed: 15, pending: 3, overdue: 1 }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Engineering Lead Dashboard</h1>
          <p className="text-slate-500">5-stage project portfolio, sprint story points velocity, engineer workload & quotation scope alignment</p>
        </div>
        <Button variant="primary" icon={<Code2 size={16} />} onClick={() => navigate('/projects')}>
          Kanban Workspace
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard title="Engineering Projects" value={(projects?.length || 6).toString()} trend="4 in active sprint" trendUp={true} icon={<Code2 size={24} className="text-sky-500" />} />
        <KPICard title="Sprint Velocity" value={`${sprintBurnDown?.completedPoints || 84}/${sprintBurnDown?.totalPoints || 120} pts`} trend={`${sprintBurnDown?.daysRemaining || 4} days left`} trendUp={true} icon={<GitPullRequest size={24} className="text-indigo-500" />} />
        <KPICard title="Pending Eng Tasks" value={(tasks?.length || 18).toString()} trend="Across 5 engineers" trendUp={true} icon={<Clock size={24} className="text-emerald-500" />} />
        <KPICard title="Overdue Tasks" value="2" trend="Action required" trendUp={false} icon={<AlertCircle size={24} className="text-rose-500" />} />
      </div>

      {/* 5-Stage Project Health Table & Quotation Alignment */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between">
          <span>Project Health Portfolio & Scope Reference (5-Stage Taxonomy)</span>
          <span className="text-xs text-slate-400 font-medium">Planning → Development → Testing → Deployment → Closed</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 font-bold uppercase text-[10px] tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Project Name</th>
                <th className="p-3.5">Stage</th>
                <th className="p-3.5">Progress %</th>
                <th className="p-3.5">Team Size</th>
                <th className="p-3.5">Quotation Ref</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(projects?.length ? projects : [
                { id: 1, name: 'EMS Core Platform Upgrade', stage: 'Development', progress: 72, team_size: 6, status: 'On Track', quotation_ref: 'Q-2026-08' },
                { id: 2, name: 'LiveKit Video Meeting Module', stage: 'Testing', progress: 90, team_size: 3, status: 'At Risk', quotation_ref: 'Q-2026-15' }
              ]).map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-all">
                  <td className="p-3.5 font-bold text-slate-900">{p.name}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full text-[10px] uppercase">
                      {p.stage || 'Development'}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">{p.progress || 75}%</td>
                  <td className="p-3.5 font-semibold text-slate-600">{p.team_size || 4} Devs</td>
                  <td className="p-3.5 font-mono text-indigo-600 font-bold">{p.quotation_ref || 'Q-2026-01'}</td>
                  <td className="p-3.5">
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                      p.status === 'On Track' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {p.status || 'On Track'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <button onClick={() => navigate(`/projects/${p.id}`)} className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1">
                      Sprint Kanban <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Engineer Velocity & Completion Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="text-indigo-600" size={20} />
          Engineer Sprint Velocity & Task Completion
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {engTeam.map((eng) => (
            <div key={eng.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
              <div>
                <h4 className="font-bold text-slate-900">{eng.name}</h4>
                <p className="text-slate-500">{eng.role}</p>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{eng.completed} Completed</span>
                <p className="text-[10px] text-slate-400 mt-1">{eng.pending} Pending • {eng.overdue} Overdue</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

