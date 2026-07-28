import React, { useEffect, useState } from 'react';
import { getMyReviews } from '../../api/lifecycle.api';
import { Star, Award, TrendingUp, Calendar } from 'lucide-react';

export const PerformanceDashboard: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getMyReviews();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Performance Data...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Performance</h1>
          <p className="text-slate-500 mt-1">Track your KPI ratings and managerial reviews</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-xl border border-slate-200">
            <Award size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No Reviews Yet</h3>
            <p className="text-slate-500">Your manager hasn't submitted a performance review for you.</p>
          </div>
        ) : (
          reviews.map((review: any) => (
            <div key={review.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
                  {review.review_period}
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={18} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'text-slate-200'} />
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Reviewer</p>
                  <p className="font-semibold text-slate-900">{review.reviewer_name}</p>
                </div>
                
                {review.kpi_score && (
                  <div>
                    <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                      <TrendingUp size={16} /> KPI Score
                    </p>
                    <p className="font-bold text-emerald-600 text-xl">{review.kpi_score}%</p>
                  </div>
                )}
                
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-700 italic">"{review.feedback}"</p>
                </div>
                
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-1">
                  <Calendar size={14} /> Submitted on {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
