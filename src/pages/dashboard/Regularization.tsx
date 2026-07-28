import React, { useEffect, useState } from 'react';
import { getMyRequests, submitRequest } from '../../api/regularization.api';
import { Clock, Plus, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Regularization: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    reason: '',
    requested_punch_in: '',
    requested_punch_out: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getMyRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert to datetime strings if provided
      const submitData = {
        date: formData.date,
        reason: formData.reason,
        requested_punch_in: formData.requested_punch_in ? `${formData.date} ${formData.requested_punch_in}:00` : null,
        requested_punch_out: formData.requested_punch_out ? `${formData.date} ${formData.requested_punch_out}:00` : null,
      };
      await submitRequest(submitData);
      alert('Regularization request submitted successfully!');
      setShowForm(false);
      setFormData({ date: '', reason: '', requested_punch_in: '', requested_punch_out: '' });
      loadData();
    } catch (err) {
      alert('Failed to submit request');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Requests...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Attendance Regularization</h1>
          <p className="text-slate-500 mt-1">Request corrections for missed punches or incorrect attendance logs</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus size={18} /> New Request
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Submit Regularization Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input 
                  type="date" required
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Requested Punch In (Optional)</label>
                <input 
                  type="time" 
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  value={formData.requested_punch_in}
                  onChange={e => setFormData({...formData, requested_punch_in: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Requested Punch Out (Optional)</label>
                <input 
                  type="time" 
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  value={formData.requested_punch_out}
                  onChange={e => setFormData({...formData, requested_punch_out: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reason for Request</label>
              <textarea 
                required
                className="w-full p-2 border border-slate-200 rounded-lg min-h-[100px]"
                placeholder="E.g., Forgot to punch in, systemic error, client meeting..."
                value={formData.reason}
                onChange={e => setFormData({...formData, reason: e.target.value})}
              ></textarea>
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
              <th className="px-6 py-3 font-semibold">Reason</th>
              <th className="px-6 py-3 font-semibold">Requested Times</th>
              <th className="px-6 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No regularization requests submitted yet.</td>
              </tr>
            ) : (
              requests.map((req: any) => (
                <tr key={req.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {new Date(req.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                    {req.reason}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {req.requested_punch_in ? new Date(req.requested_punch_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'} - 
                    {req.requested_punch_out ? new Date(req.requested_punch_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex w-fit items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                      req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {req.status === 'pending' && <Clock size={12} />}
                      {req.status === 'approved' && <CheckCircle size={12} />}
                      {req.status === 'rejected' && <XCircle size={12} />}
                      {req.status.toUpperCase()}
                    </span>
                    {req.manager_comment && (
                      <div className="mt-1 text-xs text-slate-500">
                        {req.manager_comment}
                      </div>
                    )}
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
