import React, { useEffect, useState } from 'react';
import { getCEODashboardData, exportCEOReportCSV } from '../../api/ceo.api';
import { KPICard } from '../../components/dashboard/KPICard';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { DollarSign, TrendingUp, Users, FolderKanban, Download, FileText, Sparkles, ShieldCheck, AlertCircle, CheckCircle, Plus, Eye, Megaphone, ArrowRight, Layers, Target, FileCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { toast } from '../../utils/toast';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const CEODashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [isCritical, setIsCritical] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([
    { id: 1, text: 'Q3 All-Hands Executive Review scheduled for Friday 3:00 PM', critical: true, date: 'Today' },
    { id: 2, text: 'New AI Automation Service Line official launch completed', critical: false, date: 'Yesterday' }
  ]);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await getCEODashboardData();
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error('Error fetching CEO dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await exportCEOReportCSV();
      toast.success('Executive report exported successfully.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to export CSV report.');
    } finally {
      setExporting(false);
    }
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    const newAnn = {
      id: Date.now(),
      text: announcementText,
      critical: isCritical,
      date: 'Just now'
    };
    setAnnouncements([newAnn, ...announcements]);
    setAnnouncementText('');
    toast.success(isCritical ? 'Critical announcement pinned company-wide!' : 'Company announcement posted.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500 font-medium">Loading Executive Dashboard...</span>
        </div>
      </div>
    );
  }

  const { metrics, charts, pendingInvoices, alerts, aiSummary } = data || {};
  const leadStageCounts = metrics?.leadStageCounts || { New: 5, Contacted: 8, Interested: 6, 'Meeting Scheduled': 4, 'Proposal Sent': 3, Negotiation: 2, Won: 6, Lost: 2 };
  const quotationStatusCounts = metrics?.quotationStatusCounts || { Draft: 2, Sent: 5, Accepted: 8, Rejected: 1, Expired: 1 };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header with Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">CEO Dashboard</h1>
          <p className="text-slate-500">Real-time executive performance, revenue analytics & company-wide pipeline</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            icon={<Eye size={16} />} 
            onClick={() => navigate('/admin/role-cards')}
          >
            Role Cards Directory
          </Button>
          <Button 
            variant="outline" 
            icon={<Plus size={16} />} 
            onClick={() => navigate('/quotations')}
          >
            Generate Quotation
          </Button>
          <Button 
            variant="primary" 
            icon={<FileText size={16} />} 
            onClick={handleExportCSV}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* AI Executive Summary Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs uppercase tracking-widest">
              <Sparkles size={16} className="text-indigo-400" />
              AI Executive Summary
            </div>
            <p className="text-slate-200 text-sm max-w-3xl leading-relaxed font-medium">
              {aiSummary || 'Business operations are performing steadily with balanced profit margins and active team engagement.'}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 flex items-center gap-3 shrink-0">
            <ShieldCheck size={28} className="text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Business Health Score</p>
              <p className="text-2xl font-extrabold text-white">{metrics?.businessHealthScore || 88}<span className="text-sm font-normal text-slate-300">/100</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Revenue" 
          value={`$${metrics?.revenue?.toLocaleString() || '0'}`} 
          trend={`${metrics?.profitMargin || 0}% Net Margin`} 
          trendUp={true} 
          icon={<DollarSign size={24} className="text-emerald-500" />} 
        />
        <KPICard 
          title="Monthly Revenue" 
          value={`$${metrics?.monthlyRevenue?.toLocaleString() || '0'}`} 
          trend={`+$${metrics?.outstandingPayments?.toLocaleString() || '0'} Pending`} 
          trendUp={true} 
          icon={<TrendingUp size={24} className="text-indigo-500" />} 
        />
        <KPICard 
          title="Active Headcount" 
          value={metrics?.headcount?.toString() || '0'} 
          trend={`${metrics?.attendancePercentage || 92.5}% Attendance`} 
          trendUp={true} 
          icon={<Users size={24} className="text-blue-500" />} 
        />
        <KPICard 
          title="Lead Conversion Rate" 
          value={`${metrics?.leadConversionRate || 24.0}%`} 
          trend={`${metrics?.activeProjects || 0} Active Projects`} 
          trendUp={true} 
          icon={<Target size={24} className="text-amber-500" />} 
        />
      </div>

      {/* Company-Wide Lead Pipeline Stage Overview */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Target className="text-indigo-600" size={20} />
            Company-Wide Lead Pipeline Stages
          </h3>
          <button onClick={() => navigate('/crm')} className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
            Open Client Hub (Read-Only) <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {Object.entries(leadStageCounts).map(([stage, count]) => (
            <div key={stage} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center hover:bg-indigo-50/50 transition-all">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{stage}</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{count as number}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Charts: Revenue Trend & Service Line Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue & Expense Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.revenueGrowth || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quotation Status Counts */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileCheck className="text-emerald-600" size={20} />
              Quotation Status Breakdown
            </span>
          </h3>
          <div className="space-y-3">
            {Object.entries(quotationStatusCounts).map(([status, count]) => (
              <div key={status} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">{status}</span>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                  status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                  status === 'Sent' ? 'bg-indigo-100 text-indigo-700' :
                  status === 'Draft' ? 'bg-slate-200 text-slate-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {count as number} Quotations
                </span>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4" icon={<FileText size={16} />} onClick={() => navigate('/quotations')}>
            View All Quotations
          </Button>
        </div>
      </div>

      {/* Grid: Service Line Breakdown & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Service Line */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Layers className="text-indigo-600" size={20} />
            Revenue by Service Line
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.serviceLineRevenue || [
                { name: 'AI Automation', revenue: 437500 },
                { name: 'Dynamic Website', revenue: 312500 },
                { name: 'Mobile Apps', revenue: 250000 },
                { name: 'UI/UX Design', revenue: 125000 },
                { name: 'Static Website', revenue: 75000 },
                { name: 'Branding', revenue: 50000 }
              ]} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `$${v/1000}k`} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#6366F1" radius={[0, 6, 6, 0]}>
                  {(charts?.serviceLineRevenue || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Company Announcements & Critical Pins */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Megaphone className="text-indigo-600" size={20} />
                Company Announcements
              </span>
            </h3>
            
            <form onSubmit={handlePostAnnouncement} className="mb-4 space-y-2">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Broadcast an announcement..." 
                  value={announcementText} 
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button variant="primary" size="sm" type="submit">Post</Button>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-600 font-semibold cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isCritical} 
                  onChange={(e) => setIsCritical(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Pin as Critical (Non-dismissible)
              </label>
            </form>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
              {announcements.map((ann) => (
                <div key={ann.id} className={`p-3 rounded-2xl border text-xs flex justify-between items-start ${
                  ann.critical ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-100 text-slate-800'
                }`}>
                  <div>
                    {ann.critical && <span className="font-extrabold text-[10px] uppercase bg-rose-200 text-rose-800 px-2 py-0.5 rounded mr-2">Critical</span>}
                    <span>{ann.text}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">{ann.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Workforce Snapshot & Department Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active / WFH / On Leave / Inactive Donut Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="text-blue-600" size={20} />
            Workforce Snapshot Breakdown
          </h3>
          <div className="h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active / Office', value: metrics?.headcount ? Math.round(metrics.headcount * 0.7) : 22, color: '#10B981' },
                    { name: 'WFH', value: metrics?.headcount ? Math.round(metrics.headcount * 0.2) : 6, color: '#6366F1' },
                    { name: 'On Leave', value: metrics?.headcount ? Math.round(metrics.headcount * 0.07) : 2, color: '#F59E0B' },
                    { name: 'Inactive', value: 1, color: '#94A3B8' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { color: '#10B981' }, { color: '#6366F1' }, { color: '#F59E0B' }, { color: '#94A3B8' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} Team Members`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Comparison: Attendance vs Task Completion */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="text-emerald-600" size={20} />
            Department Attendance vs Task Completion Rate
          </h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { dept: 'Engineering', attendance: 95, completion: 88 },
                { dept: 'AI / ML', attendance: 98, completion: 92 },
                { dept: 'Product & Design', attendance: 92, completion: 85 },
                { dept: 'Growth & Sales', attendance: 89, completion: 90 },
                { dept: 'Operations & HR', attendance: 96, completion: 94 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="dept" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Percentage']} />
                <Legend />
                <Bar dataKey="attendance" name="Attendance %" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completion" name="Task Completion %" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};


