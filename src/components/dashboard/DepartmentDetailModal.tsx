import React from 'react';
import { X, Users, CheckCircle2, AlertTriangle, Clock, Award, Briefcase, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DepartmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: {
    id: string;
    name: string;
    headcount: number;
    lead: string;
    attendanceRate: number;
    reviewCompletion: number;
    openRoles: number;
    health: 'green' | 'amber' | 'red';
    healthReason: string;
  } | null;
}

export const DepartmentDetailModal: React.FC<DepartmentDetailModalProps> = ({ isOpen, onClose, department }) => {
  const navigate = useNavigate();

  if (!isOpen || !department) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden transition-all transform animate-scale-in">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-950 p-6 text-white">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
              <Users size={26} className="text-indigo-400" />
            </div>
            <div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                department.health === 'green' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                department.health === 'amber' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {department.health === 'green' ? 'Healthy Operation' : department.health === 'amber' ? 'Attention Needed' : 'Critical Flag'}
              </span>
              <h3 className="font-extrabold text-2xl mt-1 tracking-tight">{department.name}</h3>
              <p className="text-xs text-slate-300 font-medium">Department Lead: <span className="text-white font-bold">{department.lead}</span></p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Health Alert Reason */}
          <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
            department.health === 'green' ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' :
            department.health === 'amber' ? 'bg-amber-50/60 border-amber-200 text-amber-800' :
            'bg-rose-50/60 border-rose-200 text-rose-800'
          }`}>
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Operational Status & Notes</p>
              <p className="mt-0.5">{department.healthReason}</p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Team</p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{department.headcount}</h4>
              <p className="text-[10px] text-slate-400 font-semibold">Employees</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance</p>
              <h4 className="text-2xl font-black text-emerald-600 mt-1">{department.attendanceRate}%</h4>
              <p className="text-[10px] text-slate-400 font-semibold">Avg Rate</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Appraisal</p>
              <h4 className="text-2xl font-black text-indigo-600 mt-1">{department.reviewCompletion}%</h4>
              <p className="text-[10px] text-slate-400 font-semibold">Completed</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Open Roles</p>
              <h4 className="text-2xl font-black text-purple-600 mt-1">{department.openRoles}</h4>
              <p className="text-[10px] text-slate-400 font-semibold">Hiring</p>
            </div>
          </div>

          {/* Department Quick Actions */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">Executive Management Actions</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => { onClose(); navigate('/users'); }}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-800 transition-all group"
              >
                <span className="flex items-center gap-2">
                  <Users size={16} className="text-indigo-600" /> View Department Members
                </span>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => { onClose(); navigate('/hr/performance'); }}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-800 transition-all group"
              >
                <span className="flex items-center gap-2">
                  <Award size={16} className="text-amber-600" /> Review Appraisals
                </span>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors"
          >
            Close Drill-Down
          </button>
        </div>

      </div>
    </div>
  );
};
