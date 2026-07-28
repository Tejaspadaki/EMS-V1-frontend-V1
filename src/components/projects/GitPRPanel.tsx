import React, { useState, useEffect } from 'react';
import { getPRs, submitPR, reviewPR } from '../../api/internship.api';
import { Button } from '../ui/Button';
import { GitPullRequest, GitMerge, XCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const GitPRPanel: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { user, role } = useAuthStore();
  const [prs, setPrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [form, setForm] = useState({ title: '', pr_url: '' });

  const loadPRs = async () => {
    try {
      const data = await getPRs(projectId);
      setPrs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPRs();
  }, [projectId]);

  const handleSubmitPR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.pr_url) return;
    try {
      await submitPR(projectId, form);
      setShowSubmitModal(false);
      setForm({ title: '', pr_url: '' });
      loadPRs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReview = async (prId: number, status: string) => {
    const feedback = prompt("Optional feedback for the author:");
    try {
      await reviewPR(prId, { status, feedback: feedback || undefined });
      loadPRs();
    } catch (err) {
      console.error(err);
    }
  };

  const isMentorOrAdmin = ['Super Admin', 'Dept Head', 'Team Lead', 'HR'].includes(role || '');

  if (loading) return <div className="p-8 text-center">Loading PRs...</div>;

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-extrabold text-lg flex items-center gap-2">
          <GitPullRequest className="text-indigo-600" /> Pull Requests & Code Reviews
        </h3>
        <Button onClick={() => setShowSubmitModal(true)} variant="primary" className="bg-slate-900 text-white flex items-center gap-2">
          <GitPullRequest size={16} /> Submit PR
        </Button>
      </div>

      <div className="space-y-4">
        {prs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            No pull requests submitted yet.
          </div>
        ) : (
          prs.map(pr => (
            <div key={pr.id} className="border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${
                    pr.status === 'merged' ? 'bg-emerald-100 text-emerald-700' :
                    pr.status === 'closed' ? 'bg-rose-100 text-rose-700' :
                    pr.status === 'needs_review' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {pr.status === 'merged' && <GitMerge size={12} />}
                    {pr.status === 'needs_review' && <Clock size={12} />}
                    {pr.status === 'closed' && <XCircle size={12} />}
                    {pr.status === 'open' && <GitPullRequest size={12} />}
                    {pr.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <a href={pr.pr_url} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">
                    {pr.title}
                  </a>
                </div>
                <div className="text-sm text-slate-500 flex items-center gap-2 mt-2">
                  <span>Author: <strong>{pr.author_name}</strong></span>
                  <span>•</span>
                  <span>{new Date(pr.created_at).toLocaleDateString()}</span>
                </div>
                {pr.mentor_feedback && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-700 border border-slate-200">
                    <strong>Feedback:</strong> {pr.mentor_feedback}
                  </div>
                )}
              </div>

              {isMentorOrAdmin && pr.status === 'needs_review' && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleReview(pr.id, 'merged')} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">Approve & Merge</Button>
                  <Button variant="outline" onClick={() => handleReview(pr.id, 'closed')} className="text-rose-600 border-rose-200 hover:bg-rose-50">Close PR</Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Submit Pull Request for Review</h2>
            <form onSubmit={handleSubmitPR} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">PR Title</label>
                <input 
                  type="text" required
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="e.g. feat: Add user login"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Git URL (GitHub/GitLab/Bitbucket)</label>
                <input 
                  type="url" required
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="https://github.com/..."
                  value={form.pr_url}
                  onChange={e => setForm({...form, pr_url: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Submit for Review</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
