import React, { useEffect, useState } from 'react';
import { getAttendanceAdminDashboard } from '../../api/attendance.api';
import { Users, Clock, AlertTriangle, UserX, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ErrorAlert from '../../components/ui/ErrorAlert';

const AttendanceDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await getAttendanceAdminDashboard();
      if (response.success) {
        setData(response.data);
      } else {
        setError('Failed to load dashboard data.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500 font-medium">Loading Attendance Dashboard...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <ErrorAlert message={error || 'Failed to load data.'} />;
  }

  const { today, trend, recentActivity } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Dashboard</h1>
          <p className="text-slate-500">Real-time overview of workforce attendance and historical trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Total Headcount</div>
            <div className="text-2xl font-bold text-slate-900">{today.totalEmployees}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Present Today</div>
            <div className="text-2xl font-bold text-slate-900">{today.present}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Late Arrivals</div>
            <div className="text-2xl font-bold text-slate-900">{today.late}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Absent Today</div>
            <div className="text-2xl font-bold text-slate-900">{today.absent}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6">7-Day Attendance Trend</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="total_present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="late_count" name="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity: any) => (
              <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <img 
                  src={activity.profile_picture_url ? `http://localhost:3000${activity.profile_picture_url}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(activity.name)} 
                  alt={activity.name} 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium text-slate-900 text-sm">{activity.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <span>{activity.type === 'check_in' || activity.type === 'FULL' ? 'Checked In' : 'Checked Out'}</span>
                    <span>•</span>
                    <span>{new Date(activity.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div className="ml-auto">
                  <span className={`inline-flex w-2.5 h-2.5 rounded-full ${activity.status === 'on_time' ? 'bg-emerald-500' : 'bg-amber-500'}`} title={activity.status}></span>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center text-slate-500 py-8">No recent activity.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboardPage;
