import React, { useEffect, useState } from 'react';
import { getAtsDashboardData } from '../../api/ats.api';
import { KPICard } from '../../components/dashboard/KPICard';
import { ATSKanbanBoard } from '../../components/ats/ATSKanbanBoard';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Briefcase, Users, Clock, Sparkles, BrainCircuit, HeartHandshake } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const ATSDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAtsDashboardData();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching ATS dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500 font-medium">Loading ATS Dashboard...</span>
        </div>
      </div>
    );
  }

  const { metrics, charts, topCandidates } = data || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Recruitment & AI Intelligence</h1>
          <p className="text-slate-500">Applicant tracking and employee sentiment</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={<BrainCircuit size={18} />}>
            AI Auto-Schedule
          </Button>
          <Button variant="primary">
            New Job Posting
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Open Positions" 
          value={metrics?.openPositions || 0}
          icon={<Briefcase size={24} />}
          colorClass="bg-sky-100 text-sky-600"
          trend={{ value: '2', isPositive: true }}
        />
        <KPICard 
          title="Total Applicants" 
          value={metrics?.totalApplicants || 0}
          icon={<Users size={24} />}
          colorClass="bg-indigo-100 text-indigo-600"
          trend={{ value: '12%', isPositive: true }}
        />
        <KPICard 
          title="Avg Time to Hire" 
          value={`${metrics?.timeToHire || 0}d`}
          icon={<Clock size={24} />}
          colorClass="bg-amber-100 text-amber-600"
          trend={{ value: '4d', isPositive: true }}
        />
        <KPICard 
          title="Employee NPS" 
          value={`${metrics?.avgNpsScore || 0}/10`}
          icon={<HeartHandshake size={24} />}
          colorClass="bg-fuchsia-100 text-fuchsia-600"
          trend={{ value: '0.2', isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NPS Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HeartHandshake className="text-fuchsia-500" size={20} /> Employee Sentiment (NPS) Trend
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.npsTrend || []}>
                <defs>
                  <linearGradient id="colorNps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D946EF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D946EF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} dy={10} />
                <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="score" stroke="#D946EF" strokeWidth={3} fillOpacity={1} fill="url(#colorNps)" activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Top Candidates */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            AI Top Matches <Sparkles className="text-amber-500" size={18} />
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {!topCandidates?.length ? (
              <p className="text-sm text-slate-500 text-center py-8">No candidates yet</p>
            ) : (
              topCandidates.map((candidate: any) => (
                <div key={candidate.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">
                        {candidate.name}
                      </h4>
                      <p className="text-xs text-slate-500">{candidate.job_title}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full mb-1">
                        {candidate.ai_score}% Match
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">{new Date(candidate.applied_date).toLocaleDateString()}</span>
                    <span className="px-2 py-1 rounded text-xs font-medium uppercase tracking-wider bg-slate-200 text-slate-700">
                      {candidate.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ATSKanbanBoard />
    </div>
  );
};
