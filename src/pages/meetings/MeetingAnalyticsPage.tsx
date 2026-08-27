import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../utils/toast';
import { Video, Users, PlayCircle, Download } from 'lucide-react';

export const MeetingAnalyticsPage: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = useAuthStore.getState().accessToken;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/meetings/admin/analytics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          toast.error(json.error?.message || 'Failed to fetch analytics');
        }
      } catch (e) {
        toast.error('Network error');
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'Admin' || user?.role === 'HR' || user?.role === 'CEO') {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div className="p-8 text-white">Loading Admin Dashboard...</div>;
  }

  if (!data) {
    return <div className="p-8 text-rose-400">Unauthorized or No Data Available.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 text-slate-200">
      <h1 className="text-3xl font-bold text-white">Meeting Analytics & Recordings</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-indigo-500/20 rounded-full">
            <Video className="text-indigo-400 w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Total Meetings Hosted</p>
            <p className="text-3xl font-bold text-white">{data.kpis.totalMeetings}</p>
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-emerald-500/20 rounded-full">
            <Users className="text-emerald-400 w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Total Participants Joined</p>
            <p className="text-3xl font-bold text-white">{data.kpis.totalParticipants}</p>
          </div>
        </div>
      </div>

      {/* Recordings Table */}
      <div className="bg-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Recent Cloud Recordings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-400 text-sm uppercase">
              <tr>
                <th className="p-4 font-semibold">Meeting Title</th>
                <th className="p-4 font-semibold">Organizer</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Size</th>
                <th className="p-4 font-semibold">Duration</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {data.recordings.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-slate-500">No recordings found.</td></tr>
              ) : data.recordings.map((rec: any) => (
                <tr key={rec.id} className="hover:bg-slate-700/50 transition">
                  <td className="p-4">{rec.meeting_title || 'Instant Meeting'}</td>
                  <td className="p-4">{rec.organizer_name}</td>
                  <td className="p-4">{new Date(rec.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-slate-300">{rec.size_bytes ? (rec.size_bytes / (1024 * 1024)).toFixed(2) + ' MB' : '-'}</td>
                  <td className="p-4 text-slate-300">{rec.duration_secs ? Math.round(rec.duration_secs / 60) + ' min' : '-'}</td>
                  <td className="p-4 flex gap-2">
                    <a 
                      href={(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000') + rec.recording_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded flex items-center gap-2 text-xs font-medium"
                    >
                      <PlayCircle size={14} /> Watch
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
