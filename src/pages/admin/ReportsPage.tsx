import React, { useEffect, useState } from 'react';
import { getReport } from '../../api/messaging.api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageSquare, HardDrive, FileText, Users, Award, ShieldAlert } from 'lucide-react';
import { toast } from '../../utils/toast';

interface DailyReport {
  date: string;
  count: number;
}

interface ActiveUser {
  id: string;
  name: string;
  email: string;
  messageCount: number;
  lastActive: string | null;
  isOnline: boolean;
}

interface FileTypeBreakdown {
  fileType: string;
  count: number;
  sizeBytes: number;
}

interface LargestFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  createdDate: string;
}

interface StorageReport {
  totalSizeBytes: number;
  totalFiles: number;
  fileTypeBreakdown: FileTypeBreakdown[];
  largestFiles: LargestFile[];
}

interface GroupActivity {
  groupId: string;
  groupName: string;
  messageCount: number;
  lastMessageDate: string | null;
  activeMembersCount: number;
}

export const ReportsPage: React.FC = () => {
  const [dailyData, setDailyData] = useState<DailyReport[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [storageData, setStorageData] = useState<StorageReport | null>(null);
  const [groupActivity, setGroupActivity] = useState<GroupActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [daily, users, storage, groups] = await Promise.all([
          getReport('daily-messages'),
          getReport('active-users'),
          getReport('storage-usage'),
          getReport('group-activity')
        ]);
        setDailyData(daily);
        setActiveUsers(users);
        setStorageData(storage);
        setGroupActivity(groups);
      } catch (err) {
        toast.error('Failed to load messaging analytics reports');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Analytics & Reports</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time statistics on employee communications, attachments storage, and group channels engagement.</p>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <MessageSquare size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Daily Messages</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {dailyData.reduce((acc, curr) => acc + curr.count, 0)}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <HardDrive size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Storage Consumed</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {storageData ? formatBytes(storageData.totalSizeBytes) : '0 Bytes'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Attachments</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {storageData ? storageData.totalFiles : 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Messaging Users</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {activeUsers.filter(u => u.messageCount > 0).length}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Volume & Storage Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Messages Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
          <h2 className="text-base font-bold text-slate-800 mb-6">Daily Messages Trend</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Storage Type Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-6">File Type Distribution</h2>
          <div className="space-y-4">
            {storageData?.fileTypeBreakdown.map((b, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600 truncate max-w-[180px]">{b.fileType}</span>
                  <span className="text-slate-400">{b.count} files ({formatBytes(b.sizeBytes)})</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${(b.sizeBytes / (storageData.totalSizeBytes || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {(!storageData || storageData.fileTypeBreakdown.length === 0) && (
              <p className="text-xs text-slate-400 text-center py-12">No files uploaded yet</p>
            )}
          </div>
        </div>
      </div>

      {/* User Engagement & Group Engagement Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Users Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Award className="text-amber-500" size={18} />
            <h2 className="text-base font-bold text-slate-800">Most Active Communicators (30 Days)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Employee</th>
                  <th className="pb-3 font-semibold text-center">Messages Sent</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {activeUsers.slice(0, 5).map((u, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-3.5">
                      <p className="font-semibold text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </td>
                    <td className="py-3.5 text-center font-bold text-slate-700">{u.messageCount}</td>
                    <td className="py-3.5 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${u.isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        {u.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Group Activity Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Users className="text-indigo-500" size={18} />
            <h2 className="text-base font-bold text-slate-800">Top Engaged Group Channels</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Group Channel</th>
                  <th className="pb-3 font-semibold text-center">Message Vol</th>
                  <th className="pb-3 font-semibold text-right">Active Members</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {groupActivity.slice(0, 5).map((g, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-3.5">
                      <p className="font-semibold text-slate-800">{g.groupName}</p>
                      <p className="text-xs text-slate-400">ID: #{g.groupId}</p>
                    </td>
                    <td className="py-3.5 text-center font-bold text-slate-700">{g.messageCount}</td>
                    <td className="py-3.5 text-right font-semibold text-slate-600">{g.activeMembersCount} members</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
