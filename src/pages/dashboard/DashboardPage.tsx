import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { getDashboardData, getDepartmentDashboard } from '../../api/admin.api';
import { getMyTasks } from '../../api/projects.api';
import { getMyRequests, getApprovalQueue } from '../../api/requests.api';
import { Users, FolderKanban, Clock, Activity, ArrowRight, UserPlus, FileText, CheckCircle, TrendingUp, BarChart3, Briefcase, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SuperAdminDashboardPage } from '../admin/SuperAdminDashboardPage';
import { Button } from '../../components/ui/Button';
import { OnboardingDashboard } from './OnboardingDashboard';
import { DeptHeadDashboard } from './DeptHeadDashboard';
import { CEODashboard } from './CEODashboard';
import { CTODashboard } from './CTODashboard';
import { InternDashboard } from './InternDashboard';
import { OperationsLeadDashboard } from './OperationsLeadDashboard';
import { GrowthLeadDashboard } from './GrowthLeadDashboard';
import { ProductLeadDashboard } from './ProductLeadDashboard';
import { DesignLeadDashboard } from './DesignLeadDashboard';
import { EngineeringLeadDashboard } from './EngineeringLeadDashboard';
import { AILeadDashboard } from './AILeadDashboard';
import { SecurityLeadDashboard } from './SecurityLeadDashboard';
import { FinanceLeadDashboard } from './FinanceLeadDashboard';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user, role } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [deptData, setDeptData] = useState<any>(null);
  const [employeeData, setEmployeeData] = useState<{ tasks: any[]; requests: any[]; approvals: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isAdminOrHR = ['Super Admin', 'HR'].includes(role || '');
  const isManager = ['Dept Head', 'Team Lead'].includes(role || '');

  if (role === 'Super Admin') {
    return <SuperAdminDashboardPage />;
  }

  if (role === 'CEO') {
    return <CEODashboard />;
  }

  if (role === 'CTO') {
    return <CTODashboard />;
  }

  if (role === 'Operations Lead' || role === 'Operations') {
    return <OperationsLeadDashboard />;
  }

  if (role === 'Growth Lead' || role === 'Growth' || role === 'Sales Lead') {
    return <GrowthLeadDashboard />;
  }

  if (role === 'Product Lead' || role === 'Product') {
    return <ProductLeadDashboard />;
  }

  if (role === 'Design Lead' || role === 'UI/UX Lead') {
    return <DesignLeadDashboard />;
  }

  if (role === 'Engineering Lead' || role === 'Eng Lead') {
    return <EngineeringLeadDashboard />;
  }

  if (role === 'AI Lead' || role === 'AI / ML Lead') {
    return <AILeadDashboard />;
  }

  if (role === 'Security Lead' || role === 'Security') {
    return <SecurityLeadDashboard />;
  }

  if (role === 'Finance Lead' || role === 'Finance') {
    return <FinanceLeadDashboard />;
  }

  if (role === 'Intern') {
    return <InternDashboard />;
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        if (isAdminOrHR) {
          const res = await getDashboardData();
          setData(res.data);
        } else if (role === 'Dept Head') {
          const { getDeptHeadDashboard } = await import('../../api/department.api');
          const [tasks, requests, approvals, deptRes] = await Promise.all([
            getMyTasks().catch(() => []),
            getMyRequests().catch(() => []),
            getApprovalQueue(role!).catch(() => []),
            getDeptHeadDashboard().catch((err) => { console.error(err); return null; })
          ]);
          setEmployeeData({ tasks, requests, approvals });
          setDeptData(deptRes);
        } else {
          const [tasks, requests, approvals] = await Promise.all([
            getMyTasks().catch(() => []),
            getMyRequests().catch(() => []),
            isManager ? getApprovalQueue(role!).catch(() => []) : Promise.resolve([])
          ]);
          setEmployeeData({ tasks, requests, approvals });
        }
      } catch (err: any) {
        if (err?.response?.status !== 401) {
          console.error('Error fetching dashboard data:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isAdminOrHR, role, isManager]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500 font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!isAdminOrHR) {
    if (role === 'Dept Head') {
      return <DeptHeadDashboard data={employeeData} deptData={deptData} />;
    }

    const activeTasks = employeeData?.tasks.filter(t => t.status !== 'DONE').length || 0;
    const pendingRequests = employeeData?.requests.filter(r => r.status === 'Pending').length || 0;
    const pendingApprovals = employeeData?.approvals.length || 0;

    const tasks = employeeData?.tasks || [];
    
    // Group tasks by status for Recharts PieChart
    const statusCounts = tasks.reduce((acc: Record<string, number>, t: any) => {
      const status = t.status || 'TODO';
      const key = status === 'TODO' || status === 'To Do' ? 'To Do' :
                  status === 'IN_PROGRESS' || status === 'In Progress' ? 'In Progress' :
                  status === 'IN_REVIEW' || status === 'Review' ? 'Review' : 'Done';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const chartData = [
      { name: 'To Do', value: statusCounts['To Do'] || 0, color: '#64748B' },
      { name: 'In Progress', value: statusCounts['In Progress'] || 0, color: '#4F46E5' },
      { name: 'Review', value: statusCounts['Review'] || 0, color: '#F59E0B' },
      { name: 'Done', value: statusCounts['Done'] || 0, color: '#10B981' },
    ].filter(item => item.value > 0);

    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
        <OnboardingDashboard />
        
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-800 to-indigo-900 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-30" />
          <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-sky-500 rounded-full blur-[60px] opacity-20" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
              <p className="text-white/70">Here's a quick overview of your daily agenda.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[100px]">
                <p className="text-3xl font-black text-white">{activeTasks}</p>
                <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mt-1">Active Tasks</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[100px]">
                <p className="text-3xl font-black text-white">{pendingRequests}</p>
                <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mt-1">Pending Leave</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <Link to="/attendance/check-in" className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <CheckCircle size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">Daily Check-In</h3>
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0" size={18} />
            </div>
          </Link>

          <Link to="/tasks" className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <FolderKanban size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">My Tasks</h3>
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all shrink-0" size={18} />
            </div>
          </Link>

          <Link to="/crm" className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Briefcase size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">My Leads Hub</h3>
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all shrink-0" size={18} />
            </div>
          </Link>

          <Link to={`/employees/${user?.id}`} className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <UserPlus size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">My Profile</h3>
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-sky-500 group-hover:translate-x-1 transition-all shrink-0" size={18} />
            </div>
          </Link>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Column 1: Tasks */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FolderKanban className="text-indigo-500" size={20} /> Upcoming Tasks
                </h3>
                <Link to="/tasks" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View All</Link>
              </div>
              
              {!employeeData?.tasks.length ? (
                <div className="text-center py-8 text-slate-500 text-sm">No tasks assigned to you right now.</div>
              ) : (
                <div className="space-y-3">
                  {employeeData.tasks.filter(t => t.status !== 'DONE').slice(0, 4).map((task) => (
                    <div key={task.id} className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors cursor-pointer" onClick={() => navigate('/tasks')}>
                      <h4 className="font-bold text-slate-800 truncate">{task.title}</h4>
                      <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                        <span className={`px-2 py-1 rounded-md ${
                          task.status === 'TODO' ? 'bg-slate-100 text-slate-600' :
                          task.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-700' :
                          task.status === 'IN_REVIEW' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-md ${
                          task.priority === 'HIGH' || task.priority === 'URGENT' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Task Analytics Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                <BarChart3 className="text-indigo-500" size={20} /> Task Workload
              </h3>
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No task data available to analyze.
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                  {/* Chart */}
                  <div className="w-[180px] h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value} tasks`, 'Count']}
                          contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend / Status list */}
                  <div className="space-y-2.5 flex-1 max-w-[200px] w-full">
                    {chartData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2 text-slate-600">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span>{item.name}</span>
                        </div>
                        <span className="text-slate-950 font-bold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{item.value}</span>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-800">
                      <span>Total Tasks</span>
                      <span>{tasks.length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Requests & Approvals */}
          <div className="space-y-6">
            
            {/* Approval Queue for Managers */}
            {isManager && (
              <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl border border-indigo-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle className="text-emerald-500" size={20} /> Approval Queue
                  </h3>
                  <Link to="/requests/queue" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Go to Queue</Link>
                </div>
                
                {pendingApprovals === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-sm">Your approval queue is empty.</div>
                ) : (
                  <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-indigo-700">{pendingApprovals}</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Requests</p>
                    </div>
                    <Button variant="primary" onClick={() => navigate('/requests/queue')}>Review Now</Button>
                  </div>
                )}
              </div>
            )}

            {/* My Requests */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="text-sky-500" size={20} /> Recent Requests
                </h3>
                <Link to="/requests/my" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View All</Link>
              </div>
              
              {!employeeData?.requests.length ? (
                <div className="text-center py-8 text-slate-500 text-sm">You haven't submitted any requests recently.</div>
              ) : (
                <div className="space-y-3">
                  {employeeData.requests.slice(0, 3).map((req) => (
                    <div key={req.id} className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between cursor-pointer hover:border-slate-300" onClick={() => navigate('/requests/my')}>
                      <div>
                        <h4 className="font-bold text-slate-800">{req.type} Request</h4>
                        <p className="text-xs text-slate-500 mt-1">{req.startDate} to {req.endDate || req.startDate}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                        req.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                        req.status === 'Inactive' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {req.status === 'Active' ? 'APPROVED' : req.status === 'Inactive' ? 'REJECTED' : 'PENDING'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Admin/HR View
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 mt-1">Key metrics and analytics for {role}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <BarChart3 size={16} className="text-indigo-500" />
          <span className="text-sm font-medium text-slate-600">Live Dashboard</span>
        </div>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-blue-50">
                  <Users size={22} className="text-blue-600" />
                </div>
                <TrendingUp size={16} className="text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{data.totalUsers}</h3>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-indigo-50">
                  <FolderKanban size={22} className="text-indigo-600" />
                </div>
                <TrendingUp size={16} className="text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-slate-500">Active Projects</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{data.activeProjects}</h3>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-amber-50">
                  <Clock size={22} className="text-amber-600" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500">Pending Requests</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{data.pendingRequests}</h3>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card hover:shadow-card-hover transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-50">
                  <Activity size={22} className="text-emerald-600" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500">System Health</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{data.systemHealth}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Daily Attendance Trend (Real Data Chart) */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Daily Attendance Trend</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Active employee check-ins over the last 7 days</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full text-xs font-semibold text-emerald-700">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Real-time
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.attendanceTrend || []}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="date" 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} 
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        allowDecimals={false}
                        tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF', 
                          borderColor: '#E2E8F0', 
                          borderRadius: '12px', 
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        name="Checked In"
                        stroke="#6366F1" 
                        strokeWidth={2.5} 
                        fillOpacity={1} 
                        fill="url(#colorCount)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Department Distribution */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card">
                <h3 className="text-base font-semibold text-slate-900 mb-5">Department Distribution</h3>
                <div className="space-y-5">
                  {data.departmentData?.map((dept: any) => (
                    <div key={dept.name}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-slate-700">{dept.name}</span>
                        <span className="text-slate-500">{dept.employees} employees</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${(dept.employees / data.totalUsers) * 100}%`, backgroundColor: dept.color || '#6366F1' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card">
                <h3 className="text-base font-semibold text-slate-900 mb-5">Recent Activity</h3>
                <div className="space-y-4">
                  {data.recentActivity?.map((activity: any, idx: number) => (
                    <div key={idx} className="flex gap-3 group">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-colors">
                        <FileText size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{activity.action}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <span>{activity.user}</span>
                          <span>·</span>
                          <span>{activity.time ? new Date(activity.time).toLocaleDateString() : 'Just now'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card">
                <h3 className="text-base font-semibold text-slate-900 mb-5 flex items-center gap-2">
                  <Calendar size={18} className="text-pink-500" />
                  Upcoming Birthdays
                </h3>
                <div className="space-y-4">
                  {data.upcomingBirthdays?.map((birthday: any) => (
                    <div key={birthday.id} className="flex items-center justify-between group">
                      <div className="flex gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center shrink-0 border border-pink-100 text-pink-500 font-bold text-xs">
                          {birthday.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate leading-snug">{birthday.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{birthday.department}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full inline-block">
                          {new Date(birthday.birthdate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          {birthday.daysRemaining === 0 ? 'Today! 🎂' : `${birthday.daysRemaining} days left`}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!data.upcomingBirthdays || data.upcomingBirthdays.length === 0) && (
                    <div className="text-center text-xs text-slate-400 py-4 font-medium">
                      No upcoming birthdays
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
