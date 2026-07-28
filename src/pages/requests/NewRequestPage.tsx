import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { type RequestType, createLeaveRequest, createWfhRequest, getMyRequests } from '../../api/requests.api';
import { toast } from '../../utils/toast';

export const NewRequestPage: React.FC = () => {
  const [type, setType] = useState<RequestType>('Leave');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [casualLeavesUsed, setCasualLeavesUsed] = useState(0);
  
  const casualLeavesTotal = 4;

  useEffect(() => {
    getMyRequests().then(requests => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      let used = 0;
      requests.forEach((r: any) => {
        if (r.type === 'LEAVE' && (r.status === 'Active' || r.status === 'Pending')) {
          const start = new Date(r.startDate);
          if (start.getMonth() === currentMonth && start.getFullYear() === currentYear) {
            if (r.endDate) {
              const end = new Date(r.endDate);
              const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              used += days;
            } else {
              used += 1;
            }
          }
        }
      });
      setCasualLeavesUsed(used);
    });
  }, []);

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    deliverables: '',
    isHalfDay: false,
    reason: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      if (type === 'Leave') {
        const startIso = new Date(formData.startDate).toISOString();
        await createLeaveRequest({ 
          startDate: startIso, 
          endDate: startIso,
          isHalfDay: formData.isHalfDay,
          reason: formData.reason
        });
      } else {
        const startIso = new Date(formData.startDate).toISOString();
        const endIso = new Date(formData.endDate).toISOString();
        await createWfhRequest({ 
          startDate: startIso, 
          endDate: endIso, 
          deliverables: formData.deliverables,
          isHalfDay: formData.isHalfDay,
          reason: formData.reason
        });
      }
      setSuccess(true);
      setFormData({ startDate: '', endDate: '', deliverables: '', isHalfDay: false, reason: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      toast.error('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">New Request</h2>
      
      <div className="ems-card p-6">
        <div className="flex bg-[var(--color-canvas)] p-1 rounded-lg mb-6 w-full max-w-sm">
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'Leave' ? 'bg-white shadow-sm text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
            onClick={() => setType('Leave')}
          >
            Leave
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'WFH' ? 'bg-white shadow-sm text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
            onClick={() => setType('WFH')}
          >
            Work From Home
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {type === 'Leave' ? (
            <>
              <div className="bg-[var(--color-canvas)] border border-[var(--color-border)] p-4 rounded-lg flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-[var(--color-text-primary)]">Casual Leave Balance</h4>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Capped at 4 days per month</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-[var(--color-primary)]">{casualLeavesTotal - casualLeavesUsed}</span>
                  <span className="text-sm text-[var(--color-text-secondary)]"> / {casualLeavesTotal} left</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Leave Date</label>
                <Input 
                  type="date" 
                  required 
                  value={formData.startDate} 
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })} 
                />
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <input 
                  type="checkbox" 
                  id="halfDayLeave"
                  checked={formData.isHalfDay}
                  onChange={e => setFormData({ ...formData, isHalfDay: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="halfDayLeave" className="text-sm font-medium text-[var(--color-text-primary)]">Half Day Leave</label>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Reason (Optional)</label>
                <textarea 
                  className="ems-input w-full min-h-[80px]"
                  placeholder="Enter the reason for your leave..."
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Start Date</label>
                  <Input 
                    type="date" 
                    required 
                    value={formData.startDate} 
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">End Date</label>
                  <Input 
                    type="date" 
                    required 
                    value={formData.endDate} 
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Deliverables</label>
                <textarea 
                  required
                  className="ems-input w-full min-h-[80px]"
                  placeholder="List the specific tasks you will accomplish while working from home..."
                  value={formData.deliverables}
                  onChange={e => setFormData({ ...formData, deliverables: e.target.value })}
                />
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <input 
                  type="checkbox" 
                  id="halfDayWfh"
                  checked={formData.isHalfDay}
                  onChange={e => setFormData({ ...formData, isHalfDay: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="halfDayWfh" className="text-sm font-medium text-[var(--color-text-primary)]">Half Day WFH</label>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Reason (Optional)</label>
                <textarea 
                  className="ems-input w-full min-h-[80px]"
                  placeholder="Enter the reason for your WFH request..."
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>
            </>
          )}

          {success && (
            <div className="p-3 bg-[var(--color-status-active-bg)] text-[var(--color-status-active-text)] rounded text-sm font-medium">
              Request submitted successfully!
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
