import React, { useEffect, useState } from 'react';
import { getMyProgram } from '../../api/internship.api';
import { getMyTasks } from '../../api/projects.api';
import { logInternHours } from '../../api/dashboard.api';
import { Trophy, Target, BookOpen, Clock, User as UserIcon, CheckCircle, Circle, GraduationCap, Plus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { toast } from '../../utils/toast';

export const InternDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [program, setProgram] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lectureHours, setLectureHours] = useState(14);
  const [labHours, setLabHours] = useState(28);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [newHoursType, setNewHoursType] = useState('Lecture');
  const [newHoursVal, setNewHoursVal] = useState(2);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [progRes, tasksRes] = await Promise.all([
          getMyProgram().catch(() => null),
          getMyTasks().catch(() => [])
        ]);
        setProgram(progRes);
        setTasks(tasksRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLogHours = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await logInternHours({ track_type: newHoursType, duration_hours: newHoursVal });
      if (newHoursType === 'Lecture') {
        setLectureHours(prev => prev + Number(newHoursVal));
      } else {
        setLabHours(prev => prev + Number(newHoursVal));
      }
      setShowHoursModal(false);
      toast.success(`Logged ${newHoursVal} ${newHoursType} hours! Submitted for manager approval.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to log intern hours');
    }
  };


  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Intern Dashboard...</div>;
  }

  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-indigo-600 text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded text-white">Internship Track</span>
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-400 text-slate-900 px-2.5 py-0.5 rounded">Lead Contributor Role</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-indigo-100 max-w-lg">Track your lecture & lab training hours, check program milestones, and work closely with your mentor.</p>
        </div>
        <div className="mt-6 md:mt-0 bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/30 text-center min-w-[200px]">
          <p className="text-sm font-medium text-indigo-100 mb-1">Overall Progress</p>
          <div className="text-4xl font-extrabold">{program?.progress_pct || 65}%</div>
        </div>
      </div>

      {/* Log Hours Modal */}
      {showHoursModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="text-indigo-600" size={20} />
              Log Intern Lecture / Lab Hours
            </h3>
            <form onSubmit={handleLogHours} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Track Type</label>
                <select 
                  value={newHoursType} 
                  onChange={(e) => setNewHoursType(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Lecture">Lecture Training</option>
                  <option value="Lab">Hands-on Practical Lab</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Duration (Hours)</label>
                <input 
                  type="number" 
                  min="0.5" 
                  max="8" 
                  step="0.5"
                  value={newHoursVal}
                  onChange={(e) => setNewHoursVal(Number(e.target.value))}
                  className="w-full mt-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400">Note: All leave & hours logs route through Team Lead / Dept Head approval.</p>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowHoursModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm">Submit for Approval</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lecture & Lab Hours Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Lecture Training</span>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">{lectureHours} Hours</h3>
            <p className="text-xs text-slate-400 mt-1">Theory & Architecture Modules</p>
          </div>
          <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={() => { setNewHoursType('Lecture'); setShowHoursModal(true); }}>
            Log Hours
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Practical Lab</span>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">{labHours} Hours</h3>
            <p className="text-xs text-slate-400 mt-1">Hands-on Code & Project Lab</p>
          </div>
          <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={() => { setNewHoursType('Lab'); setShowHoursModal(true); }}>
            Log Hours
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Progress & Milestones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline & Milestones */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Trophy className="text-amber-500" size={20} /> Internship Milestones
              </h2>
            </div>
            
            <div className="space-y-6">
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${program?.progress_pct || 65}%` }}
                ></div>
              </div>
              
              <div className="space-y-4">
                {(program?.milestones || [
                  { id: 1, title: 'Orientation & Development Environment Setup', status: 'completed', due_date: '2026-06-15' },
                  { id: 2, title: 'React UI Component Library Lab Submission', status: 'completed', due_date: '2026-07-01' },
                  { id: 3, title: 'Full Stack API Integration Mid-Term Capstone', status: 'in_progress', due_date: '2026-08-10' }
                ]).map((milestone: any) => (
                  <div key={milestone.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${milestone.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {milestone.status === 'completed' ? <CheckCircle size={14} /> : <Circle size={14} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{milestone.title}</h4>
                        <p className="text-slate-400 mt-0.5">Due: {milestone.due_date}</p>
                      </div>
                    </div>
                    <span className={`font-bold px-2 py-0.5 rounded uppercase text-[9px] ${
                      milestone.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {milestone.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Mentor & Tasks */}
        <div className="space-y-6">
          {/* Mentor Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <UserIcon className="text-blue-500" size={20} /> Your Mentor
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
                {(program?.mentor_name || 'Dr. Elena Rostova').charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{program?.mentor_name || 'Dr. Elena Rostova'}</h3>
                <p className="text-xs text-slate-500">{program?.mentor_email || 'elena@novynth.com'}</p>
              </div>
            </div>
          </div>

          {/* Quick Tasks */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Target className="text-rose-500" size={20} /> Assigned Tasks
            </h2>
            <ul className="space-y-3">
              {(pendingTasks.length ? pendingTasks : [
                { id: 1, title: 'Implement Face Enrollment Camera Component', status: 'IN_PROGRESS' },
                { id: 2, title: 'Write Jest Unit Tests for Attendance Route', status: 'TODO' }
              ]).map(task => (
                <li key={task.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg text-xs">
                  <Clock className="text-slate-400 mt-0.5 shrink-0" size={14} />
                  <div>
                    <p className="font-medium text-slate-800">{task.title}</p>
                    <p className="text-slate-500 capitalize mt-0.5">{task.status.replace('_', ' ')}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

