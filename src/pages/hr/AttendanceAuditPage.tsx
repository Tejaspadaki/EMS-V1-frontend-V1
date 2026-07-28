import React, { useEffect, useState } from 'react';
import { ShieldCheck, Calendar, MapPin, Clock, Search, Download } from 'lucide-react';
import { getAuditLogs, exportAuditLogsPDF, AuditLogEntry } from '../../api/attendance.api';
import ErrorAlert from '../../components/ui/ErrorAlert';

const AttendanceAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await getAuditLogs();
      setLogs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch audit logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await exportAuditLogsPDF();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Attendance_Audit_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setError('Failed to download PDF report.');
    }
  };

  const filteredLogs = logs.filter(log => 
    log.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.emp_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.ip_address && log.ip_address.includes(searchTerm))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Attendance Audit Logs</h1>
            <p className="text-slate-500">Security overview of device fingerprints and IP addresses.</p>
          </div>
        </div>
        
        <div className="relative w-72">
          <input 
            type="text" 
            placeholder="Search by Employee, ID, or IP..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
        </div>
        
        <button 
          onClick={handleDownloadPDF}
          className="ml-4 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading audit logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Employee</th>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  <th className="px-6 py-4 font-medium">Event Type</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">IP Address</th>
                  <th className="px-6 py-4 font-medium">Device Fingerprint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{log.name}</div>
                      <div className="text-xs text-slate-500">{log.emp_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{new Date(log.recorded_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 mt-1">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{new Date(log.recorded_at).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${
                        log.type === 'check_in' || log.type === 'FULL' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                      }`}>
                        {log.type === 'check_in' || log.type === 'FULL' ? 'Check In' : 'Check Out'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        log.status === 'on_time' ? 'bg-emerald-50 text-emerald-700' :
                        (log.status === 'late' || log.status === 'early_departure') ? 'bg-amber-50 text-amber-700' :
                        'bg-rose-50 text-rose-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          log.status === 'on_time' ? 'bg-emerald-500' :
                          (log.status === 'late' || log.status === 'early_departure') ? 'bg-amber-500' :
                          'bg-rose-500'
                        }`} />
                        {log.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {log.ip_address || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-[250px] truncate" title={log.device_info || 'Unknown'}>
                      {log.device_info || 'Unknown'}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No audit logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceAuditPage;
