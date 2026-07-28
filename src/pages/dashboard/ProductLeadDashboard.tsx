import React, { useEffect, useState } from 'react';
import { getProductDashboardData } from '../../api/dashboard.api';
import { KPICard } from '../../components/dashboard/KPICard';
import { 
  Compass, Layers, MessageSquare, CheckSquare, Sparkles, AlertCircle, ArrowRight, Plus, ExternalLink 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { toast } from '../../utils/toast';
import { useNavigate } from 'react-router-dom';

export const ProductLeadDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [roadmapList, setRoadmapList] = useState<any[]>([
    { id: 1, title: 'AI Automated Lead Scoring Engine', quarter: 'Q3 2026', status: 'In Progress', market_notes: 'High demand from Growth sales team' },
    { id: 2, title: 'Multi-Tenant Billing Portal', quarter: 'Q3 2026', status: 'Planned', market_notes: 'Required for SaaS expansion' },
    { id: 3, title: 'Mobile Attendance Geofencing', quarter: 'Q2 2026', status: 'Shipped', market_notes: 'Completed in v2.4 release' }
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProductDashboardData();
        setData(res);
      } catch (err) {
        console.error('Error loading Product dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusToggle = (id: number) => {
    setRoadmapList(prev => prev.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === 'Planned' ? 'In Progress' : r.status === 'In Progress' ? 'Shipped' : 'Planned';
        toast.success(`Updated initiative status to ${nextStatus}`);
        return { ...r, status: nextStatus };
      }
      return r;
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const { dependencies, feedbackLeads, productTasks } = data || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Product Lead Dashboard</h1>
          <p className="text-slate-500">Quarterly product roadmap, cross-team dependencies, initiatives & client feedback</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => toast.info('New Roadmap Initiative modal opened')}>
          + New Initiative
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard title="Roadmap Initiatives" value={(roadmapList.length).toString()} trend="2 In Progress" trendUp={true} icon={<Compass size={24} className="text-indigo-500" />} />
        <KPICard title="Cross-Team Blockers" value={(dependencies?.length || 2).toString()} trend="1 Needs Escalation" trendUp={false} icon={<AlertCircle size={24} className="text-amber-500" />} />
        <KPICard title="Product Feedback Leads" value={(feedbackLeads?.length || 4).toString()} trend="Surfaced from Sales" trendUp={true} icon={<MessageSquare size={24} className="text-sky-500" />} />
        <KPICard title="Active Engineering Tasks" value={(productTasks?.length || 12).toString()} trend="Executing across teams" trendUp={true} icon={<CheckSquare size={24} className="text-emerald-500" />} />
      </div>

      {/* Grid: Roadmap & Dependencies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quarterly Roadmap */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Compass className="text-indigo-600" size={20} /> Quarterly Product Roadmap
            </span>
            <span className="text-xs text-slate-400 font-medium">Click status badge to toggle</span>
          </h3>
          <div className="space-y-3">
            {roadmapList.map((item: any) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px] uppercase">{item.quarter}</span>
                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                  </div>
                  <p className="text-slate-500 mt-1 text-[11px]">Market Note: {item.market_notes}</p>
                </div>
                <button 
                  onClick={() => handleStatusToggle(item.id)}
                  className={`font-bold px-3 py-1 rounded-full text-[10px] transition-all cursor-pointer ${
                    item.status === 'Shipped' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 
                    item.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {item.status}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cross-Team Dependency Log */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Layers className="text-amber-500" size={20} /> Cross-Team Dependency Log
          </h3>
          <div className="space-y-3">
            {(dependencies || []).map((dep: any) => (
              <div key={dep.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-700">{dep.blockingDept} → {dep.blockedDept}</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{dep.status}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1">{dep.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Surfaced Client Feedback Leads (Read-Only Client Hub) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <MessageSquare className="text-sky-500" size={20} /> Surfaced Client Feedback & Feature Requests
        </h3>
        <div className="space-y-3">
          {(feedbackLeads?.length ? feedbackLeads : [
            { id: 1, client_name: 'Acme Corp', title: 'Requesting Dark Mode & Custom PDF Templates', stage: 'Proposal Sent' },
            { id: 2, title: 'Needs REST Webhook Triggers on Task Completion', client_name: 'Starlight Tech', stage: 'Interested' }
          ]).map((fb: any) => (
            <div key={fb.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-slate-900">{fb.title}</h4>
                <p className="text-slate-500 mt-0.5">Client: {fb.client_name} • Pipeline Stage: {fb.stage}</p>
              </div>
              <Button variant="outline" size="sm" icon={<ExternalLink size={14} />} onClick={() => navigate('/crm')}>
                Read-Only Client Hub
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

