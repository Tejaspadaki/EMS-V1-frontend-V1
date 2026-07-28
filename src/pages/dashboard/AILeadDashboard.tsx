import React, { useEffect, useState } from 'react';
import { getAILeadDashboardData } from '../../api/dashboard.api';
import { KPICard } from '../../components/dashboard/KPICard';
import { Cpu, Sparkles, Brain, CheckCircle2, ArrowRight, Users, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { toast } from '../../utils/toast';
import { useNavigate } from 'react-router-dom';

export const AILeadDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAILeadDashboardData();
        setData(res);
      } catch (err) {
        console.error('Error loading AI Lead dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  const { aiProjects } = data || {};

  const mlTeam = [
    { id: 1, name: 'Dr. Elena Rostova', role: 'Principal ML Scientist', model: 'Facial Recognition v2' },
    { id: 2, name: 'Karthik Nair', role: 'GenAI Engineer', model: 'LLM Executive Summarizer' },
    { id: 3, name: 'Ethan Hunt', role: 'Computer Vision Engineer', model: 'Attendance Video Pipeline' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Lead Dashboard</h1>
        <p className="text-slate-500">AI Automation projects, ML/GenAI engineer velocity & client quotation requirements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="AI Initiatives" value={(aiProjects?.length || 4).toString()} trend="LLM & Vision Models" trendUp={true} icon={<Brain size={24} className="text-purple-500" />} />
        <KPICard title="ML Engineers" value={mlTeam.length.toString()} trend="Active on sprint" trendUp={true} icon={<Cpu size={24} className="text-indigo-500" />} />
        <KPICard title="AI Quotation Alignment" value="3 Tagged" trend="Linked to Client Hub" trendUp={true} icon={<Sparkles size={24} className="text-emerald-500" />} />
      </div>

      {/* AI Projects Portfolio (5-Stage Taxonomy) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">AI Project Portfolio (5-Stage Taxonomy)</h3>
        <div className="space-y-3">
          {(aiProjects?.length ? aiProjects : [
            { id: 1, name: 'Facial Recognition Attendance Engine', stage: 'Testing', progress: 88, quotation_ref: 'Q-AI-101' },
            { id: 2, name: 'AI Executive Summary Generator', stage: 'Deployment', progress: 95, quotation_ref: 'Q-AI-104' },
            { id: 3, name: 'Smart Lead Scoring Model', stage: 'Development', progress: 45, quotation_ref: 'Q-AI-109' }
          ]).map((aip: any) => (
            <div key={aip.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{aip.name}</h4>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">{aip.stage}</span>
                </div>
                <p className="text-slate-500 mt-1">Completion Progress: {aip.progress}% • Linked Quotation: <strong className="text-indigo-600 font-mono">{aip.quotation_ref || 'Q-AI-100'}</strong></p>
              </div>
              <a href={`#/projects/${aip.id}`} className="text-xs text-indigo-600 font-bold hover:underline inline-flex items-center gap-1">
                AI Kanban <ArrowRight size={12} />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* ML / GenAI Team Roster */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="text-purple-600" size={20} />
          ML & GenAI Engineer Roster
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mlTeam.map(eng => (
            <div key={eng.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <h4 className="font-bold text-slate-900">{eng.name}</h4>
              <p className="text-slate-500">{eng.role}</p>
              <span className="mt-2 inline-block font-mono font-bold text-[10px] text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                Model: {eng.model}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

