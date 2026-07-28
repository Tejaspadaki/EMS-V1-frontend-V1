import React, { useEffect, useState } from 'react';
import { getExitRequests, processExitRequest } from '../../api/lifecycle.api';
import { UserMinus, CheckCircle2, AlertCircle, Search, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { exportToCSV } from '../../utils/export';

export const ExitManagement: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getExitRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id: number, updates: any) => {
    setProcessingId(id);
    try {
      await processExitRequest(id, updates);
      await loadData();
    } catch (err) {
      alert('Failed to process update');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Exit Requests...</div>;

  const filteredRequests = requests.filter((req: any) => 
    req.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    if (!filteredRequests.length) return;
    const exportData = filteredRequests.map((r: any) => ({
      ID: r.id,
      Employee: r.name,
      Reason: r.reason,
      NoticePeriodEnd: r.notice_period_end,
      Status: r.status,
      AssetClearance: r.asset_clearance ? 'Yes' : 'No',
      FNFStatus: r.fnf_status
    }));
    exportToCSV(exportData, `Exit_Requests_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Exit Management</h1>
          <p className="text-slate-500 mt-1">Manage resignations, notice periods, and FNF settlements</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              />
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2">
            <Download size={16} /> Export CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="px-6 py-3 font-semibold">Employee</th>
                <th className="px-6 py-3 font-semibold">Reason</th>
                <th className="px-6 py-3 font-semibold">Notice End</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Clearances</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No active exit requests found.</td>
                </tr>
              ) : (
                filteredRequests.map((req: any) => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{req.name}</div>
                      <div className="text-xs text-slate-500">{req.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {new Date(req.notice_period_end).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        req.status === 'completed' ? 'bg-slate-100 text-slate-600' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {req.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className={`flex items-center gap-1 ${req.asset_clearance ? 'text-emerald-600' : 'text-slate-400'}`}>
                          <CheckCircle2 size={14} /> Assets
                        </span>
                        <span className={`flex items-center gap-1 ${req.fnf_status === 'processed' ? 'text-emerald-600' : 'text-slate-400'}`}>
                          <CheckCircle2 size={14} /> FNF
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {req.status === 'pending' && (
                        <Button 
                          variant="primary" size="sm" 
                          disabled={processingId === req.id}
                          onClick={() => handleProcess(req.id, { status: 'approved' })}
                        >
                          Approve Resignation
                        </Button>
                      )}
                      {req.status === 'approved' && req.fnf_status === 'processed' && req.asset_clearance && (
                         <Button 
                           variant="primary" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white"
                           disabled={processingId === req.id}
                           onClick={() => handleProcess(req.id, { status: 'completed' })}
                         >
                           Finalize Exit
                         </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
