import React, { useEffect, useState } from 'react';
import { getMyClaims, submitClaim } from '../../api/claims.api';
import { Receipt, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const MyClaims: React.FC = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'travel',
    amount: '',
    currency: 'USD',
    receipt_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getMyClaims();
      setClaims(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitClaim(formData);
      alert('Claim submitted successfully!');
      setShowForm(false);
      setFormData({ type: 'travel', amount: '', currency: 'USD', receipt_url: '' });
      loadData();
    } catch (err) {
      alert('Failed to submit claim');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Claims...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Claims</h1>
          <p className="text-slate-500 mt-1">Submit and track your expense reimbursements</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus size={18} /> New Claim
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Submit New Claim</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Expense Type</label>
                <select 
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="travel">Travel</option>
                  <option value="medical">Medical</option>
                  <option value="supplies">Office Supplies</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input 
                  type="number" step="0.01" required
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Receipt URL (Optional)</label>
              <input 
                type="text"
                className="w-full p-2 border border-slate-200 rounded-lg"
                value={formData.receipt_url}
                onChange={e => setFormData({...formData, receipt_url: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Submit</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
              <th className="px-6 py-3 font-semibold">Date</th>
              <th className="px-6 py-3 font-semibold">Type</th>
              <th className="px-6 py-3 font-semibold">Amount</th>
              <th className="px-6 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {claims.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No claims submitted yet.</td>
              </tr>
            ) : (
              claims.map((claim: any) => (
                <tr key={claim.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {new Date(claim.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium capitalize text-slate-900">
                    {claim.type}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">
                    {claim.amount} {claim.currency}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex w-fit items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                      claim.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      claim.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      claim.status === 'reimbursed' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {claim.status === 'pending' && <Clock size={12} />}
                      {(claim.status === 'approved' || claim.status === 'reimbursed') && <CheckCircle size={12} />}
                      {claim.status === 'rejected' && <XCircle size={12} />}
                      {claim.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
