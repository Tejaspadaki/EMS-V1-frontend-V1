import React, { useEffect, useState } from 'react';
import { 
  getAllRequests, processRequest, type RegularizationRequest 
} from '../../api/regularization.api';
import { 
  Clock, CheckCircle2, XCircle, Search, Filter, RefreshCw, 
  Calendar, MessageSquare, AlertCircle, Check, X, Shield 
} from 'lucide-react';

export const RegularizationApprovalPage: React.FC = () => {
  const [requests, setRequests] = useState<RegularizationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Processing Modal State
  const [selectedReq, setSelectedReq] = useState<RegularizationRequest | null>(null);
  const [actionType, setActionType] = useState<'approved' | 'rejected' | null>(null);
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllRequests();
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to load regularization requests', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProcessModal = (req: RegularizationRequest, action: 'approved' | 'rejected') => {
    setSelectedReq(req);
    setActionType(action);
    setComment('');
    setError('');
  };

  const handleProcessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !actionType) return;

    setProcessing(true);
    setError('');

    try {
      await processRequest(selectedReq.id, actionType, comment);
      setSelectedReq(null);
      setActionType(null);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to process request');
    } finally {
      setProcessing(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesFilter = activeFilter === 'all' || r.status === activeFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (r.employee_name && r.employee_name.toLowerCase().includes(query)) ||
      (r.employee_department && r.employee_department.toLowerCase().includes(query)) ||
      (r.reason && r.reason.toLowerCase().includes(query)) ||
      (r.date && r.date.includes(query));

    return matchesFilter && matchesSearch;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-3">
        <RefreshCw size={28} className="animate-spin text-indigo-600" />
        <p className="text-sm font-medium">Loading Regularization Requests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Attendance Regularization Queue
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review and approve employee missed punch-in/out attendance fix requests
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
        >
          <RefreshCw size={14} /> Refresh Requests
        </button>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{pendingCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approved Requests</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{approvedCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rejected Requests</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{rejectedCount}</h3>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 text-xs font-bold rounded-lg capitalize transition-all whitespace-nowrap ${
                activeFilter === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab} {tab === 'pending' && pendingCount > 0 ? `(${pendingCount})` : ''}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee, dept, reason..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Clock size={44} className="mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">No Regularization Requests Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeFilter === 'pending'
                ? 'Great job! There are no pending punch fix requests awaiting your approval.'
                : 'No regularization records match your current filter settings.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-6">Fix Date</th>
                  <th className="py-3.5 px-6">Requested Timestamps</th>
                  <th className="py-3.5 px-6">Reason</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div>
                        <p className="font-bold text-slate-900">{req.employee_name || 'N/A'}</p>
                        <p className="text-xs text-slate-500 font-normal">{req.employee_department || req.employee_email}</p>
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={15} className="text-indigo-500" />
                        {new Date(req.date).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap text-xs">
                      <div className="space-y-0.5">
                        <p className="font-medium text-slate-700">
                          <span className="text-slate-400">In:</span> {req.requested_punch_in ? new Date(req.requested_punch_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                        </p>
                        <p className="font-medium text-slate-700">
                          <span className="text-slate-400">Out:</span> {req.requested_punch_out ? new Date(req.requested_punch_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-6 max-w-xs truncate text-xs text-slate-700">
                      "{req.reason}"
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        req.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {req.status === 'pending' && <Clock size={12} />}
                        {req.status === 'approved' && <CheckCircle2 size={12} />}
                        {req.status === 'rejected' && <XCircle size={12} />}
                        {req.status.toUpperCase()}
                      </span>
                      {req.manager_comment && (
                        <p className="text-[11px] text-slate-400 italic mt-1 max-w-xs truncate">
                          Note: {req.manager_comment}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenProcessModal(req, 'approved')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            onClick={() => handleOpenProcessModal(req, 'rejected')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approval / Rejection Modal */}
      {selectedReq && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden transition-all transform animate-scale-in">
            <div className={`p-5 text-white font-bold text-base flex items-center justify-between ${
              actionType === 'approved' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-rose-600 to-pink-600'
            }`}>
              <span>{actionType === 'approved' ? 'Approve Attendance Fix' : 'Reject Attendance Fix'}</span>
              <button onClick={() => setSelectedReq(null)} className="p-1 text-white/80 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProcessSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p><span className="font-semibold">Employee:</span> {selectedReq.employee_name}</p>
                <p><span className="font-semibold">Fix Date:</span> {new Date(selectedReq.date).toLocaleDateString()}</p>
                <p><span className="font-semibold">Reason:</span> {selectedReq.reason}</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Manager Remarks / Comments (Optional)
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={actionType === 'approved' ? 'Approved. Punch-in log regularized.' : 'Reason for rejection...'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className={`flex-1 py-2.5 text-white font-semibold text-sm rounded-xl shadow-md transition-all disabled:opacity-50 ${
                    actionType === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {processing ? 'Processing...' : actionType === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
