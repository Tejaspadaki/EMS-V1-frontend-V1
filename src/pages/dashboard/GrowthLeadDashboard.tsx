import React, { useEffect, useState } from 'react';
import { getGrowthDashboardData } from '../../api/dashboard.api';
import { KPICard } from '../../components/dashboard/KPICard';
import { 
  TrendingUp, Users, Target, PhoneCall, Mail, Calendar, 
  Search, Filter, Plus, ArrowRight, CheckCircle2, UserCheck, Shield, Send, Check, X, Sparkles 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { toast } from '../../utils/toast';
import { useNavigate } from 'react-router-dom';

const STAGES = ['New', 'Contacted', 'Interested', 'Meeting Scheduled', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

export const GrowthLeadDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('Introduction');
  const [leadList, setLeadList] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getGrowthDashboardData();
        setData(res);
        if (res?.leads) setLeadList(res.leads);
      } catch (err) {
        console.error('Error loading Growth dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStageChange = (leadId: number, newStage: string) => {
    setLeadList(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
    toast.success(`Moved lead to ${newStage}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500 font-medium">Loading Growth Sales Hub...</span>
        </div>
      </div>
    );
  }

  const { stageCounts, attribution, followUpQueue } = data || {};

  const teamRoster = [
    { id: 1, name: 'Alex Rivera', role: 'Senior Growth Specialist', conversion: '32%', meetings: 12 },
    { id: 2, name: 'Maya Patel', role: 'Outbound BDR Lead', conversion: '28%', meetings: 18 },
    { id: 3, name: 'Lucas Scott', role: 'Sales Account Exec', conversion: '24%', meetings: 9 }
  ];

  const filteredLeads = (leadList.length ? leadList : [
    { id: 1, client_name: 'Starlight Tech Solutions', title: 'Enterprise Web Modernization', stage: 'Proposal Sent', owner_name: 'Alex Rivera', estimated_value: '45000' },
    { id: 2, client_name: 'Apex Global Logistics', title: 'AI Automated Dispatch System', stage: 'Meeting Scheduled', owner_name: 'Maya Patel', estimated_value: '68000' },
    { id: 3, client_name: 'Nova Health Systems', title: 'Mobile Patient Portal', stage: 'Negotiation', owner_name: 'Lucas Scott', estimated_value: '35000' }
  ]).filter((l: any) => {
    const matchesStage = activeStage === 'All' || l.stage === activeStage;
    const matchesSearch = l.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Growth Lead Sales Hub</h1>
          <p className="text-slate-500">8-stage lead pipeline, sales team roster, campaign attribution & outreach templates</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" icon={<Mail size={16} />} onClick={() => setShowTemplateModal(true)}>
            Outreach Templates
          </Button>
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => navigate('/crm')}>
            + New Lead / Client Hub
          </Button>
        </div>
      </div>

      {/* Outreach Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Mail className="text-indigo-600" size={20} />
              Outreach Template Composer (Email & WhatsApp)
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Template Type</label>
                <select 
                  value={selectedTemplate} 
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Introduction">Cold Email — Intro to Novynth AI & Web</option>
                  <option value="Proposal Followup">Follow-Up — Quotation & Proposal Review</option>
                  <option value="Meeting Request">WhatsApp — Demo & Discovery Call Invite</option>
                </select>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono text-slate-700 leading-relaxed">
                {selectedTemplate === 'Introduction' ? (
                  `Hi {{client_name}},\n\nI noticed {{company_name}} is scaling its digital presence. At Novynth, we specialize in high-converting web applications and AI automations...\n\nBest,\n{{rep_name}}`
                ) : selectedTemplate === 'Proposal Followup' ? (
                  `Hi {{client_name}},\n\nFollowing up on the proposal sent on {{proposal_date}}. We would love to address any questions regarding project scope...\n\nBest,\n{{rep_name}}`
                ) : (
                  `Hey {{client_name}}, Maya here from Novynth! Are you open for a quick 15-min demo this week on AI Lead Scoring?`
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowTemplateModal(false)}>Close</Button>
                <Button variant="primary" size="sm" icon={<Send size={14} />} onClick={() => { toast.success('Template copied to clipboard!'); setShowTemplateModal(false); }}>Copy Template</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard title="Total Pipeline Value" value="$148,000" trend="+18% vs last month" trendUp={true} icon={<TrendingUp size={24} className="text-emerald-500" />} />
        <KPICard title="Active Pipeline Leads" value={(filteredLeads.length || 24).toString()} trend="14 in active talk" trendUp={true} icon={<Target size={24} className="text-indigo-500" />} />
        <KPICard title="Meetings Booked (30d)" value="39" trend="85% completion rate" trendUp={true} icon={<Calendar size={24} className="text-sky-500" />} />
        <KPICard title="Won Clients (30d)" value="6" trend="28% team conversion" trendUp={true} icon={<UserCheck size={24} className="text-amber-500" />} />
      </div>

      {/* 8-Stage Selector Pills */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-2">
        <button 
          onClick={() => setActiveStage('All')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeStage === 'All' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Stages ({filteredLeads.length})
        </button>
        {STAGES.map(st => (
          <button 
            key={st} 
            onClick={() => setActiveStage(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeStage === st ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st} ({stageCounts?.[st] || filteredLeads.filter(l => l.stage === st).length})
          </button>
        ))}
      </div>

      {/* Lead Pipeline Grid & Rep Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Lead Pipeline */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-bold text-slate-900">8-Stage Lead Pipeline Tracker</h3>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search lead or client..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredLeads.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-12">No leads found in this stage.</p>
              ) : (
                filteredLeads.map((ld: any) => (
                  <div key={ld.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-all shadow-2xs flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{ld.client_name}</h4>
                        <span className="text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded">
                          {ld.stage}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{ld.title} • Owner: {ld.owner_name || 'Growth Rep'}</p>
                      
                      {/* Move Stage Selector */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[10px] text-slate-400 font-bold">Move Stage:</span>
                        <select 
                          value={ld.stage}
                          onChange={(e) => handleStageChange(ld.id, e.target.value)}
                          className="text-[10px] font-semibold bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-700"
                        >
                          {STAGES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-slate-900">${parseFloat(ld.estimated_value || '0').toLocaleString()}</p>
                      <button 
                        onClick={() => navigate('/crm')}
                        className="text-xs text-indigo-600 font-bold hover:underline mt-1 inline-flex items-center gap-1"
                      >
                        Client Hub <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Growth Team Roster & Attribution */}
        <div className="space-y-6">
          {/* Team Roster & Performance */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="text-indigo-600" size={18} />
              Growth Team Roster & Velocity
            </h3>
            <div className="space-y-3">
              {teamRoster.map(member => (
                <div key={member.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{member.name}</h5>
                    <p className="text-[11px] text-slate-500">{member.role}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{member.conversion} Conv</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{member.meetings} Meetings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campaign Source Attribution */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Campaign Source Attribution</h3>
            <div className="space-y-3">
              {(attribution || [
                { source: 'LinkedIn Outbound', count: 18, conversion: '22%' },
                { source: 'Website Contact', count: 24, conversion: '35%' },
                { source: 'Partner Referral', count: 10, conversion: '50%' },
                { source: 'Cold Email', count: 32, conversion: '12%' }
              ]).map((attr: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{attr.source}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{attr.count} leads</span>
                    <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{attr.conversion}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

