import React, { useState, useEffect } from 'react';
import { Star, X, Award, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { performanceApi } from '../../api/performance.api';
import { getDirectoryUsers } from '../../api/admin.api';

interface PerformanceReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PerformanceReviewModal: React.FC<PerformanceReviewModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [userId, setUserId] = useState<string>('');
  const [reviewPeriod, setReviewPeriod] = useState<string>('Q1 2026');
  const [rating, setRating] = useState<number>(4);
  const [kpiScore, setKpiScore] = useState<number>(85);
  const [feedback, setFeedback] = useState<string>('');
  
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
      console.error('Failed to load users for performance review', err);
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
      await performanceApi.submitReview({
        user_id: Number(userId),
        review_period: reviewPeriod,
        rating,
        kpi_score: kpiScore,
        feedback
      });

      onSuccess();
      onClose();
      // Reset form
      setFeedback('');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden transition-all transform animate-scale-in">
        
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
              <Award size={24} className="text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">Conduct Performance Review</h3>
              <p className="text-xs text-indigo-100 mt-0.5">Submit rating, KPI score, and feedback for employee</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
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
                    {u.name} — {u.department || u.role || 'Employee'} ({u.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Review Period */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Review Period
            </label>
            <select
              value={reviewPeriod}
              onChange={(e) => setReviewPeriod(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
            >
              <option value="Q1 2026">Q1 2026 (Jan - Mar)</option>
              <option value="Q2 2026">Q2 2026 (Apr - Jun)</option>
              <option value="Q3 2026">Q3 2026 (Jul - Sep)</option>
              <option value="Q4 2026">Q4 2026 (Oct - Dec)</option>
              <option value="Annual 2026">Annual Review 2026</option>
              <option value="Probation Review">Probationary Evaluation</option>
              <option value="Mid-Year Review">Mid-Year Performance Check</option>
            </select>
          </div>

          {/* Star Rating Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Performance Rating (1 - 5 Stars)
            </label>
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform focus:outline-none"
                >
                  <Star
                    size={32}
                    className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                  />
                </button>
              ))}
              <span className="ml-3 font-bold text-slate-700 text-sm">{rating} / 5 Stars</span>
            </div>
          </div>

          {/* KPI Score */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              KPI Score (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={kpiScore}
                onChange={(e) => setKpiScore(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                placeholder="e.g. 85"
                required
              />
              <TrendingUp size={18} className="absolute right-3.5 top-3 text-slate-400" />
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Detailed Feedback & Managerial Remarks
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none resize-none"
              placeholder="Provide constructive feedback, achievements, areas of improvement..."
              required
            />
          </div>

          {/* Footer Submit */}
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
              {submitting ? 'Submitting...' : 'Submit Appraisal'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
