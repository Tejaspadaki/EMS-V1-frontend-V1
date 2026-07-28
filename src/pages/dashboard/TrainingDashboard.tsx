import React, { useEffect, useState } from 'react';
import { getTrainingPrograms, getMyTrainings, enrollInTraining } from '../../api/lifecycle.api';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const TrainingDashboard: React.FC = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [myTrainings, setMyTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [progData, myData] = await Promise.all([
        getTrainingPrograms(),
        getMyTrainings()
      ]);
      setPrograms(progData);
      setMyTrainings(myData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (id: number) => {
    try {
      await enrollInTraining(id);
      alert('Successfully enrolled in training program!');
      await loadData();
    } catch (err: any) {
      console.error('Error enrolling:', err);
      const backendMessage = err.response?.data?.error?.message || err.response?.data?.message;
      alert(backendMessage || 'Failed to enroll');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Training Center...</div>;

  const enrolledIds = myTrainings.map(t => t.program_id);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Training Center</h1>
          <p className="text-slate-500 mt-1">Develop your skills and track mandatory compliance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-600" /> Available Programs
          </h2>
          {programs.map(prog => (
            <div key={prog.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{prog.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{prog.description}</p>
                </div>
                {prog.mandatory && (
                  <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Mandatory</span>
                )}
              </div>
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Clock size={16} /> {prog.estimated_hours} Hours
                </div>
                {enrolledIds.includes(prog.id) ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1 text-sm"><CheckCircle size={16} /> Enrolled</span>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => handleEnroll(prog.id)}>Enroll Now</Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-600" /> My Learning Path
          </h2>
          {myTrainings.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
              You haven't enrolled in any training programs yet.
            </div>
          ) : (
            myTrainings.map(t => (
              <div key={t.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-white shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">{t.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    t.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    t.status === 'in_progress' ? 'bg-sky-500/20 text-sky-400' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>Progress</span>
                    <span>{t.progress_pct}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${t.progress_pct}%` }}></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
