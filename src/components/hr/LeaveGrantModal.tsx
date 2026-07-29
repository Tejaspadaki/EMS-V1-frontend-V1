import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle, AlertCircle, PlusCircle } from 'lucide-react';
import api from '../../api/axios';
import { getDirectoryUsers } from '../../api/admin.api';

interface LeaveGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LeaveGrantModal: React.FC<LeaveGrantModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [userId, setUserId] = useState<string>('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [casualLeaves, setCasualLeaves] = useState<number>(12);
  const [sickLeaves, setSickLeaves] = useState<number>(6);
  const [earnedLeaves, setEarnedLeaves] = useState<number>(15);

  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await getDirectoryUsers();
      setUsers(data);
      if (data.length > 0) {
        setUserId(String(data[0].id));
      }
    } catch (err) {
      console.error('Failed to load users for leave grant', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('Please select an employee');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/leaves/grant', {
        user_id: Number(userId),
        year,
        casual_leaves: Number(casualLeaves),
        sick_leaves: Number(sickLeaves),
        earned_leaves: Number(earnedLeaves)
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to grant leaves');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden transition-all transform animate-scale-in">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md">
              <Calendar size={24} className="text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">Grant / Allocate Leaves</h3>
              <p className="text-xs text-indigo-100 mt-0.5">Assign yearly leave balances to employee</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Select Employee */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Employee
            </label>
            {loadingUsers ? (
              <div className="text-xs text-slate-400 py-2">Loading employees...</div>
            ) : (
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                required
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Year */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Allocation Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              required
            />
          </div>

          {/* Leave Balances Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Casual Leaves
              </label>
              <input
                type="number"
                min="0"
                value={casualLeaves}
                onChange={(e) => setCasualLeaves(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 text-center"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Sick Leaves
              </label>
              <input
                type="number"
                min="0"
                value={sickLeaves}
                onChange={(e) => setSickLeaves(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 text-center"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Earned Leaves
              </label>
              <input
                type="number"
                min="0"
                value={earnedLeaves}
                onChange={(e) => setEarnedLeaves(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 text-center"
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              {submitting ? 'Granting...' : 'Grant Leaves'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
