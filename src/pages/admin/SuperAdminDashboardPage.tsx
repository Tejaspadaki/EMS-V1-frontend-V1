import React, { useEffect, useState } from 'react';
import { 
  Users, Briefcase, Activity, 
  TrendingUp, TrendingDown, Clock, 
  Zap, Globe
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { getDashboardData } from '../../api/admin.api';

// Static UI demonstration data (activityData is kept static since no backend table supports request vs login timeseries yet)
const activityData = [
  { name: 'Mon', requests: 40, logins: 24 },
  { name: 'Tue', requests: 30, logins: 13 },
  { name: 'Wed', requests: 20, logins: 98 },
  { name: 'Thu', requests: 27, logins: 39 },
  { name: 'Fri', requests: 18, logins: 48 },
  { name: 'Sat', requests: 23, logins: 38 },
  { name: 'Sun', requests: 34, logins: 43 },
];

export const SuperAdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboardData();
        if (res.success) {
          setData(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 border-t-transparent shadow-lg"></div>
      </div>
    );
  }

  // Fallbacks in case db is completely empty
  const deptData = data?.departmentData?.length > 0 ? data.departmentData : [
    { name: 'Eng', employees: 45, color: '#3b82f6' }
  ];
  const recentActivities = data?.recentActivity?.length > 0 ? data.recentActivity : [
    { action: "System Initialized", user: "Admin", time: "Just now", bg: "bg-emerald-100", border: "border-emerald-200" }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative">
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 tracking-tight">
            Super Admin Dashboard
          </h2>
          <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            System overview and key metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            System Online
          </span>
        </div>
      </div>

      {/* Top Stats Cards - Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={data?.totalUsers || 0} 
          trend="+5%" 
          trendUp={true} 
          icon={<Users className="w-6 h-6 text-white" />} 
          gradient="from-blue-500 to-blue-600"
          shadowColor="shadow-blue-500/20"
        />
        <StatCard 
          title="Active Projects" 
          value={data?.activeProjects || 0} 
          trend="+2%" 
          trendUp={true} 
          icon={<Briefcase className="w-6 h-6 text-white" />} 
          gradient="from-indigo-500 to-purple-600"
          shadowColor="shadow-indigo-500/20"
        />
        <StatCard 
          title="Pending Requests" 
          value={data?.pendingRequests || 0} 
          trend="-1%" 
          trendUp={false} 
          icon={<Clock className="w-6 h-6 text-white" />} 
          gradient="from-amber-400 to-orange-500"
          shadowColor="shadow-orange-500/20"
        />
        <StatCard 
          title="System Health" 
          value={data?.systemHealth || "99.9%"} 
          trend="+0.1%" 
          trendUp={true} 
          icon={<Zap className="w-6 h-6 text-white" />} 
          gradient="from-emerald-400 to-teal-500"
          shadowColor="shadow-emerald-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500 -z-10"></div>
          
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Weekly Activity</h3>
              <p className="text-sm text-gray-500 mt-1">Requests vs Logins across the platform</p>
            </div>
            <select className="text-sm border border-gray-200 rounded-xl text-gray-600 bg-gray-50/50 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer hover:bg-gray-100/50">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          
          <div className="h-80 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(4px)' }}
                />
                <Area type="monotone" dataKey="requests" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRequests)" activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }} />
                <Area type="monotone" dataKey="logins" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLogins)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart Area */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500 -z-10"></div>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800">Employees by Dept</h3>
            <p className="text-sm text-gray-500 mt-1">Distribution across company</p>
          </div>
          
          <div className="flex-1 min-h-[280px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" opacity={0.5} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 600 }} width={60} />
                <RechartsTooltip cursor={{fill: 'rgba(243, 244, 246, 0.5)'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}/>
                <Bar dataKey="employees" radius={[0, 6, 6, 0]} barSize={24}>
                  {
                    deptData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-1/2 w-96 h-96 bg-gray-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10"></div>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Recent System Activity</h3>
            <p className="text-sm text-gray-500 mt-1">Latest events from the event log</p>
          </div>
          <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg transition-colors">
            View All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentActivities.map((item: any, i: number) => (
            <div key={i} className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-indigo-100 transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl bg-blue-100 border border-blue-200 group-hover:scale-110 transition-transform duration-300`}>
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{item.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5">by <span className="font-medium">{item.user}</span></p>
                </div>
              </div>
              <span className="text-xs text-gray-400 font-semibold bg-gray-50 px-2.5 py-1 rounded-md">
                {item.time === 'Just now' || !item.time ? 'Just now' : new Date(item.time).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

// Helper Component for Stats Card
const StatCard = ({ title, value, trend, trendUp, icon, gradient, shadowColor }: any) => (
  <div className={`bg-white rounded-2xl p-1 relative overflow-hidden group shadow-lg ${shadowColor} hover:-translate-y-1 transition-all duration-300`}>
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
    <div className="bg-white/90 backdrop-blur-md h-full w-full rounded-xl p-5 border border-white flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-bold text-gray-500 tracking-wide uppercase mb-1">{title}</p>
          <h4 className="text-3xl font-extrabold text-gray-800 tracking-tight">{value}</h4>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-md shadow-black/10 transform group-hover:rotate-6 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center text-sm mt-2">
        <span className={`flex items-center font-bold px-2 py-1 rounded-md ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
          {trendUp ? <TrendingUp className="w-4 h-4 mr-1" strokeWidth={3} /> : <TrendingDown className="w-4 h-4 mr-1" strokeWidth={3} />}
          {trend}
        </span>
        <span className="text-gray-400 font-medium ml-3 text-xs">vs last month</span>
      </div>
    </div>
  </div>
);
