import React, { useEffect, useState } from 'react';
import { performanceApi, type PerformanceReview, type PerformanceAnalytics } from '../../api/performance.api';
import { PerformanceReviewModal } from '../../components/hr/PerformanceReviewModal';
import { 
  Award, Star, TrendingUp, Users, PlusCircle, Search, 
  Filter, Calendar, RefreshCw, CheckCircle2 
} from 'lucide-react';

export const HRPerformanceDashboard: React.FC = () => {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [analytics, setAnalytics] = useState<PerformanceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allReviews, stats] = await Promise.all([
        performanceApi.getAllReviews(),
        performanceApi.getAnalytics()
      ]);
      setReviews(allReviews || []);
      setAnalytics(stats || null);
    } catch (err) {
      console.error('Failed to load HR performance data', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const query = searchQuery.toLowerCase();
    return (
      (r.employee_name && r.employee_name.toLowerCase().includes(query)) ||
      (r.employee_department && r.employee_department.toLowerCase().includes(query)) ||
      (r.review_period && r.review_period.toLowerCase().includes(query)) ||
      (r.reviewer_name && r.reviewer_name.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-3">
        <RefreshCw size={28} className="animate-spin text-indigo-600" />
        <p className="text-sm font-medium">Loading HR Performance Records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Performance & Appraisals
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage company employee performance reviews, KPI evaluations, and appraisal reports
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-95 shrink-0"
        >
          <PlusCircle size={18} />
          Conduct Review
        </button>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Reviews</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{analytics?.total_reviews || reviews.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <Star size={24} className="fill-amber-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Rating</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{analytics?.avg_rating || 0} / 5.0</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg KPI Score</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{analytics?.avg_kpi_score || 0}%</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Performers</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{analytics?.top_performers_count || 0}</h3>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by employee, dept, period..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Showing <span className="text-slate-900 font-bold">{filteredReviews.length}</span> performance appraisals
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Award size={44} className="mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">No Appraisal Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No performance reviews match your filter criteria. Click "Conduct Review" above to submit a new review.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-6">Period</th>
                  <th className="py-3.5 px-6">Rating</th>
                  <th className="py-3.5 px-6">KPI Score</th>
                  <th className="py-3.5 px-6">Reviewer</th>
                  <th className="py-3.5 px-6">Feedback / Remarks</th>
                  <th className="py-3.5 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div>
                        <p className="font-bold text-slate-900">{review.employee_name || 'N/A'}</p>
                        <p className="text-xs text-slate-500 font-normal">{review.employee_department || review.employee_email}</p>
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-100">
                        {review.review_period}
                      </span>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            fill={i < review.rating ? 'currentColor' : 'none'} 
                            className={i < review.rating ? '' : 'text-slate-200'} 
                          />
                        ))}
                        <span className="ml-1.5 font-bold text-slate-800 text-xs">{review.rating}.0</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      {review.kpi_score != null ? (
                        <span className="font-extrabold text-emerald-600 text-sm">
                          {review.kpi_score}%
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">N/A</span>
                      )}
                    </td>

                    <td className="py-4 px-6 font-medium text-slate-700 whitespace-nowrap">
                      {review.reviewer_name || 'HR Admin'}
                    </td>

                    <td className="py-4 px-6 max-w-xs truncate text-xs text-slate-600 italic">
                      "{review.feedback || 'No comments'}"
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <PerformanceReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
