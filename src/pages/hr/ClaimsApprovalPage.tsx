import React, { useEffect, useState } from 'react';
import { getPendingClaims, processClaim } from '../../api/claims.api';
import { FileText, CheckCircle2, XCircle, RefreshCw, DollarSign, Clock, Check, X, ExternalLink } from 'lucide-react';

export const ClaimsApprovalPage: React.FC = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getPendingClaims();
      setClaims(data || []);
    } catch (err) {
      console.error('Failed to load pending claims', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id: number, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      await processClaim(id, status);
      await loadData();
    } catch (err) {
      alert('Failed to process expense claim');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-3">
        <RefreshCw size={28} className="animate-spin text-indigo-600" />
        <p className="text-sm font-medium">Loading Pending Expense Claims...</p>
      </div>
    );
  }

  const totalAmount = claims.reduce((acc, c) => acc + Number(c.amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Expense Claims Approval
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review and process pending employee expense reimbursements and claims
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Claims</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{claims.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pending Value</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">${totalAmount.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {claims.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText size={44} className="mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">No Pending Expense Claims</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All employee expense claims have been processed!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-6">Claim Type</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Receipt / File</th>
                  <th className="py-3.5 px-6">Submitted On</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div>
                        <p className="font-bold text-slate-900">{claim.name || 'N/A'}</p>
                        <p className="text-xs text-slate-500 font-normal">{claim.email}</p>
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-100 uppercase">
                        {claim.type}
                      </span>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap font-black text-emerald-600 text-base">
                      {claim.currency || '$'}{Number(claim.amount).toLocaleString()}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap text-xs">
                      {claim.receipt_url ? (
                        <a
                          href={claim.receipt_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-semibold"
                        >
                          View Receipt <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-slate-400">No Receipt</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={processingId === claim.id}
                          onClick={() => handleProcess(claim.id, 'approved')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          disabled={processingId === claim.id}
                          onClick={() => handleProcess(claim.id, 'rejected')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
