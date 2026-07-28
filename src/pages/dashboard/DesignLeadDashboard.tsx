import React, { useEffect, useState } from 'react';
import { getDesignDashboardData } from '../../api/dashboard.api';
import { KPICard } from '../../components/dashboard/KPICard';
import { Palette, Layout, Users, FolderCheck, CheckCircle2, ArrowRight, FolderKanban, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { toast } from '../../utils/toast';
import { useNavigate } from 'react-router-dom';

export const DesignLeadDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [designersList, setDesignersList] = useState<any[]>([
    { 
      id: 1, name: 'Sophia Chen', email: 'sophia@novynth.com',
      tasks: [
        { id: 101, title: 'Mobile App Navigation Redesign', status: 'IN_PROGRESS', client: 'Apex Retail' },
        { id: 102, title: 'CRM Customer Hub Wireframes', status: 'IN_REVIEW', client: 'Quantum Solutions' },
        { id: 103, title: 'Design System Tokens', status: 'DONE', client: 'Internal Platform' }
      ]
    },
    { 
      id: 2, name: 'Liam Miller', email: 'liam@novynth.com',
      tasks: [
        { id: 201, title: 'AI Executive Summary PDF Layout', status: 'IN_PROGRESS', client: 'Enterprise Lead' },
        { id: 202, title: 'Dashboard Dark Mode Palette Specs', status: 'DONE', client: 'Internal Platform' }
      ]
    }
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDesignDashboardData();
        setData(res);
      } catch (err) {
        console.error('Error loading Design dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleTaskStatus = (designerId: number, taskId: number) => {
    setDesignersList(prev => prev.map(d => {
      if (d.id === designerId) {
        const updatedTasks = d.tasks.map((t: any) => {
          if (t.id === taskId) {
            const nextStatus = t.status === 'IN_PROGRESS' ? 'IN_REVIEW' : t.status === 'IN_REVIEW' ? 'DONE' : 'IN_PROGRESS';
            toast.success(`Task moved to ${nextStatus.replace('_', ' ')}`);
            return { ...t, status: nextStatus };
          }
          return t;
        });
        return { ...d, tasks: updatedTasks };
      }
      return d;
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Design Lead Hub</h1>
          <p className="text-slate-500">UI/UX designer team roster, designer swimlanes, client linked design tasks & asset files</p>
        </div>
        <Button variant="primary" icon={<FolderCheck size={16} />} onClick={() => navigate('/files')}>
          Client Hub Files Explorer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="UI/UX Designers" value={designersList.length.toString()} trend="All active" trendUp={true} icon={<Users size={24} className="text-violet-500" />} />
        <KPICard title="Active Design Tasks" value="5" trend="2 In Review" trendUp={true} icon={<Palette size={24} className="text-pink-500" />} />
        <KPICard title="Design Asset Exports" value="34 Files" trend="Figma & SVG tokens" trendUp={true} icon={<FolderCheck size={24} className="text-emerald-500" />} />
      </div>

      {/* Designer Swimlane Kanban */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Layout className="text-violet-600" size={20} /> Designer Task Swimlane (Click card badge to toggle status)
          </span>
          <span className="text-xs text-slate-400 font-medium">No Lead Ownership Boundary Enforced</span>
        </h3>
        <div className="space-y-4">
          {designersList.map((des) => (
            <div key={des.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-slate-900 text-sm">{des.name} ({des.email})</h4>
                <span className="text-xs text-slate-400">UI/UX Designer</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {des.tasks.map((task: any) => (
                  <div key={task.id} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between text-xs">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{task.client}</span>
                        <button 
                          onClick={() => handleToggleTaskStatus(des.id, task.id)}
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase cursor-pointer transition-all ${
                            task.status === 'DONE' ? 'bg-emerald-100 text-emerald-700' :
                            task.status === 'IN_REVIEW' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </button>
                      </div>
                      <p className="font-semibold text-slate-800 mt-2">{task.title}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-medium">Design Asset</span>
                      <button onClick={() => navigate('/files')} className="text-indigo-600 font-bold text-[10px] hover:underline flex items-center gap-1">
                        Files Tab <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

