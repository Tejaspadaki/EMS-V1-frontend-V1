import React, { useState } from 'react';
import { X, UserMinus, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

interface ResignationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResignationModal: React.FC<ResignationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [noticePeriodEnd, setNoticePeriodEnd] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !noticePeriodEnd) {
      setError('Please provide a reason and expected notice period end date.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/exit/resign', {
        reason,
        notice_period_end: noticePeriodEnd
      });

      onSuccess();
      onClose();
      setReason('');
      setNoticePeriodEnd('');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to submit resignation request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden transition-all transform animate-scale-in">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-5 text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md">
              <UserMinus size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">Submit Resignation Request</h3>
              <p className="text-xs text-rose-100 mt-0.5">Initiate formal exit & notice clearance process</p>
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

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Reason for Resignation
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State your reason for leaving..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all outline-none resize-none"
              required
            />
          </div>

          {/* Expected Notice End Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Expected Last Working Day (Notice End Date)
            </label>
            <input
              type="date"
              value={noticePeriodEnd}
              onChange={(e) => setNoticePeriodEnd(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all outline-none"
              required
            />
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
              className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-rose-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              {submitting ? 'Submitting...' : 'Submit Resignation'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
