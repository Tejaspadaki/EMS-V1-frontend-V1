import React, { useEffect, useState } from 'react';
import { getHRDemographics } from '../../api/hr.api';
import { Users, UserPlus, PieChart as PieChartIcon, BarChart3, Activity, ShieldCheck, Settings, UserCheck, CheckCircle2, UserX, Calendar } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Button } from '../../components/ui/Button';
import { toast } from '../../utils/toast';
import { useNavigate } from 'react-router-dom';
import { LeaveGrantModal } from '../../components/hr/LeaveGrantModal';

export const HRDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDemographics = async () => {
      try {
        const res = await getHRDemographics();
        setData(res);
      } catch (error) {
        console.error('Failed to load HR demographics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDemographics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500 font-medium">Loading HR Analytics...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-center text-slate-500">Failed to load HR data.</div>;
  }

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const GENDER_COLORS = ['#3b82f6', '#ec4899', '#94a3b8'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in p-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">HR Lead Dashboard</h1>
          <p className="text-slate-500 mt-1">Employee lifecycle, onboarding/offboarding handover, leave policies & demographics</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" icon={<Calendar size={16} />} onClick={() => setGrantModalOpen(true)}>
            Grant Leaves
          </Button>
          <Button variant="outline" icon={<Users size={16} />} onClick={() => navigate('/users')}>
            Employee Directory
          </Button>
          <Button variant="primary" icon={<UserPlus size={16} />} onClick={() => navigate('/hr/onboard')}>
            + Register Employee
          </Button>
        </div>
      </div>

      <LeaveGrantModal
        isOpen={grantModalOpen}
        onClose={() => setGrantModalOpen(false)}
        onSuccess={() => toast.success('Leave balances granted successfully!')}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Employees</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{data.summary?.totalEmployees || 32}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Active Onboarding Hires</p>
            <h3 className="text-3xl font-bold text-emerald-600 mt-1">{data.summary?.activeEmployees || 4}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">New Joinees (30 days)</p>
            <h3 className="text-3xl font-bold text-sky-600 mt-1">{data.summary?.newJoinees || 3}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <UserPlus size={24} />
          </div>
        </div>
      </div>

      {/* Onboarding / Offboarding Handover & HR Policy Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Onboarding & Ops Handover */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <UserCheck className="text-emerald-600" size={20} />
              Onboarding & Offboarding Handover
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate('/hr/onboarding-dashboard')}>View Board</Button>
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900">Day-1 Orientation & Checklist</h4>
                <p className="text-slate-500">Auto-add to Org Chart within 48h</p>
              </div>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Completed</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900">Offboarding Zero-Orphan Account Check</h4>
                <p className="text-slate-500">Tool access revocation before last day</p>
              </div>
              <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Ops Sync Active</span>
            </div>
          </div>
        </div>

        {/* HR Policy Configuration Shortcuts */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Settings className="text-indigo-600" size={20} />
            HR Policy Configuration Shortcuts
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Annual Leave Limit</span>
              <p className="font-extrabold text-slate-900 text-sm mt-1">21 Days / Year</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Late Login Threshold</span>
              <p className="font-extrabold text-slate-900 text-sm mt-1">15 Mins Grace</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Inactivity Timeout</span>
              <p className="font-extrabold text-slate-900 text-sm mt-1">10 Mins Idle</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Document File Limit</span>
              <p className="font-extrabold text-slate-900 text-sm mt-1">10 MB Max</p>
            </div>
          </div>
        </div>
      </div>

      {/* Intern Training Lecture & Lab Hours Company-Wide Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="text-purple-600" size={20} />
            Internship Program — Lecture & Lab Hours Tracker (Company-Wide)
          </span>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
            6 Active Interns
          </span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
            <p className="text-[10px] font-bold text-purple-600 uppercase">Total Lecture Hours Logged</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">84 Hours</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Theory & Architecture Modules</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-600 uppercase">Total Practical Lab Hours</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">168 Hours</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Hands-on Code & Project Submissions</p>
          </div>
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
            <p className="text-[10px] font-bold text-indigo-600 uppercase">Intern Contributor Role Guard</p>
            <p className="text-xs font-bold text-slate-800 mt-1">All leave & WFH requests route through Team Lead / Dept Head approval</p>
          </div>
        </div>
      </div>


      {/* Demographics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
            <BarChart3 className="text-indigo-500" size={20} /> Department Distribution
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.departmentDistribution} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="department" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]}>
                  {data.departmentDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender and Age Ratio */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <PieChartIcon className="text-sky-500" size={20} /> Gender Ratio
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.genderRatio}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="gender"
                  >
                    {data.genderRatio.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

