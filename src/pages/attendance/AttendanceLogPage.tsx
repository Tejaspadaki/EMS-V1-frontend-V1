import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { getEmployeeDetails, type AttendanceLogEntry } from '../../api/employees.api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Calendar, Clock, AlertCircle, Activity, LogOut, Loader, CheckCircle2 } from 'lucide-react';
import { submitCheckOut } from '../../api/attendance.api';

export const AttendanceLogPage: React.FC = () => {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<AttendanceLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchLogs = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }
    try {
      const data = await getEmployeeDetails(user.id);
      setLogs(data.attendances || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user?.id]);

  const handleCheckOut = async () => {
    setCheckingOut(true);
    setError(null);

    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.');
      setCheckingOut(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await submitCheckOut(position.coords.latitude, position.coords.longitude);
          await fetchLogs();
        } catch (err: any) {
          setError(err.response?.data?.error?.message || err.message || 'Check-out failed.');
        } finally {
          setCheckingOut(false);
        }
      },
      (geoError) => {
        setError('Location permission denied or unavailable. Please enable location to check out.');
        setCheckingOut(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const hasCheckedOutToday = logs.some(log => {
    const logDate = new Date(log.date).toDateString();
    const today = new Date().toDateString();
    return logDate === today && (log.type === 'check_out' || log.type.toLowerCase().includes('out'));
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="text-sm text-slate-500 mt-4 font-medium">Loading attendance records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="text-indigo-600" size={24} />
            Attendance Log
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Review your face check-in history and biometric login events.
          </p>
        </div>
        <div>
          <Button 
            variant={hasCheckedOutToday ? 'outline' : 'accent'}
            onClick={handleCheckOut}
            disabled={checkingOut || hasCheckedOutToday}
            className="w-full md:w-auto px-5 py-2.5 font-semibold shrink-0 transition-all flex items-center justify-center gap-2"
          >
            {checkingOut ? (
              <>
                <Loader size={16} className="animate-spin" />
                Checking Out...
              </>
            ) : hasCheckedOutToday ? (
              <>
                <CheckCircle2 size={16} className="text-emerald-500" />
                Checked Out Today
              </>
            ) : (
              <>
                <LogOut size={16} />
                Check Out
              </>
            )}
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="border-rose-100 bg-rose-50/50">
          <CardContent className="p-5 flex items-start gap-3">
            <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-rose-800 text-sm">Error Loading Logs</h4>
              <p className="text-xs text-rose-700 mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <Calendar className="text-slate-400" size={24} />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">No records found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              You haven't completed any face check-ins yet. Head over to the Check-In tab to log your attendance.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-700">
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Event Type</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Recorded Time</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {logs.map((log) => {
                  const isCheckIn = log.type === 'check_in' || log.type.toLowerCase().includes('in');
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isCheckIn ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {isCheckIn ? <Clock size={16} /> : <LogOut size={16} />}
                          </div>
                          <span className="capitalize">{log.type.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(log.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono">
                        {new Date(log.recordedAt).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {log.status ? (
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                            log.status === 'on_time' ? 'bg-emerald-50 text-emerald-700' :
                            (log.status === 'late' || log.status === 'early_departure') ? 'bg-amber-50 text-amber-700' :
                            'bg-rose-50 text-rose-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              log.status === 'on_time' ? 'bg-emerald-500' :
                              (log.status === 'late' || log.status === 'early_departure') ? 'bg-amber-500' :
                              'bg-rose-500'
                            }`} />
                            {log.status === 'on_time' ? 'On Time' : log.status === 'late' ? 'Late' : log.status === 'early_departure' ? 'Early Departure' : 'Half Day'}
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-50 text-slate-700`}>
                            <span className={`w-1.5 h-1.5 rounded-full bg-slate-500`} />
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
