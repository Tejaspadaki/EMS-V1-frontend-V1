import React, { useState } from 'react';
import { updateChecklistItem } from '../../api/hr.api';
import { StatusChip } from '../ui/StatusChip';
import { useNavigate } from 'react-router-dom';
import { Check, Send, FileText } from 'lucide-react';
import { FaceEnrollmentModal } from './FaceEnrollmentModal';
import { SendEmailModal } from './SendEmailModal';
import { toast } from '../../utils/toast';

export interface ChecklistItem {
  key: string;
  label: string;
  completed: boolean;
}

export interface EmployeeOnboardingData {
  id: string;
  empId: string;
  name: string;
  department: string;
  role: string;
  status: 'Pending' | 'Active';
  checklist: ChecklistItem[];
}

export const OnboardingCard: React.FC<{ employee: EmployeeOnboardingData }> = ({ employee }) => {
  const [data, setData] = useState<EmployeeOnboardingData>(employee);
  const [animating, setAnimating] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollKey, setEnrollKey] = useState<string | null>(null);
  const [sendEmailModalOpen, setSendEmailModalOpen] = useState(false);
  const navigate = useNavigate();

  const completedCount = data.checklist.filter(item => item.completed).length;
  const totalCount = data.checklist.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);


  const applyToggle = async (key: string, newStatus: boolean) => {
    // Optimistic Update
    const newChecklist = data.checklist.map(item => 
      item.key === key ? { ...item, completed: newStatus } : item
    );
    
    let newOverallStatus: 'Pending' | 'Active' = data.status;
    const allNowCompleted = newChecklist.every(item => item.completed);
    
    if (allNowCompleted) {
      newOverallStatus = 'Active';
      setAnimating(true);
      setTimeout(() => setAnimating(false), 1000); // clear animation class
    }

    setData({ ...data, checklist: newChecklist, status: newOverallStatus });

    try {
      await updateChecklistItem(data.id, key, newStatus);
    } catch (error) {
      // Revert on failure (simple implementation)
      setData(data);
      console.error('Failed to update checklist item');
    }
  };

  const handleToggle = async (key: string, currentStatus: boolean) => {
    // Intercept documents collection to navigate to the documents page
    if (key === 'documentsCollected') {
      navigate(`/hr/documents/${data.id}`);
      return;
    }

    // If it's already active/complete globally, don't allow unchecking
    if (data.status === 'Active') return;

    // Intercept face enrollment to open the camera modal instead
    if (key === 'faceEnrolmentDone' || key === 'faceEnrollment' || key === 'face_enrolment_done') {
      if (currentStatus) {
        toast.success('Face is already enrolled for this employee.');
        return;
      }
      setEnrollKey(key);
      setEnrollModalOpen(true);
      return;
    }

    await applyToggle(key, !currentStatus);
  };

  const handleEnrollSuccess = () => {
    setEnrollModalOpen(false);
    if (enrollKey) {
      applyToggle(enrollKey, true);
    }
  };

  return (
    <div className={`ems-card p-5 flex flex-col gap-4 transition-all duration-300 ${animating ? 'ring-2 ring-[var(--color-status-active-text)] shadow-lg scale-[1.02]' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">{data.name}</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">{data.role} • {data.department}</p>
          <p className="text-xs font-mono text-[var(--color-text-secondary)] mt-1">{data.empId}</p>
        </div>
        <div className={`transition-all duration-500 flex flex-col items-end gap-2 ${animating ? 'scale-110' : 'scale-100'}`}>
          <StatusChip 
            variant={data.status === 'Active' ? 'active' : 'pending'} 
            label={data.status} 
          />
          <div className="flex items-center gap-1 mt-1">
            <button 
              onClick={() => navigate(`/hr/documents/${data.id}`)}
              className="flex items-center justify-center p-1.5 rounded-full text-[var(--color-primary)] hover:bg-slate-100 transition-colors"
              title="Manage Documents"
            >
              <FileText size={18} />
            </button>
            <button 
              onClick={() => setSendEmailModalOpen(true)}
              className="flex items-center justify-center p-1.5 rounded-full text-[var(--color-primary)] hover:bg-slate-100 transition-colors"
              title="Send Onboarding Details"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-2">
        <div className="flex justify-between text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
          <span>Onboarding Progress</span>
          <span>{completedCount}/{totalCount}</span>
        </div>
        <div className="w-full bg-[var(--color-border)] rounded-full h-2 overflow-hidden">
          <div 
            className="bg-[var(--color-accent)] h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="flex flex-col gap-2 mt-2">
        {data.checklist.map((item) => (
          <label 
            key={item.key} 
            className={`flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer
              ${item.completed ? 'bg-[var(--color-canvas)] opacity-70' : 'hover:bg-gray-50'}
              ${data.status === 'Active' ? 'cursor-default pointer-events-none' : ''}
            `}
          >
            <div className={`
              w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors
              ${item.completed ? 'bg-[var(--color-accent)] border-[var(--color-accent)]' : 'border-gray-300 bg-white'}
            `}>
              {item.completed && <Check size={14} className="text-white" />}
            </div>
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={item.completed}
              onChange={() => handleToggle(item.key, item.completed)}
              disabled={data.status === 'Active' && item.key !== 'documentsCollected'}
            />
            <span className={`text-sm ${item.completed ? 'line-through text-[var(--color-text-secondary)]' : 'text-[var(--color-text-primary)] font-medium'}`}>
              {item.label}
            </span>
          </label>
        ))}
      </div>

      <FaceEnrollmentModal 
        isOpen={enrollModalOpen} 
        onClose={() => setEnrollModalOpen(false)} 
        employeeId={data.id} 
        onSuccess={handleEnrollSuccess} 
      />
      <SendEmailModal
        isOpen={sendEmailModalOpen}
        onClose={() => setSendEmailModalOpen(false)}
        employee={data}
        onSuccess={() => setSendEmailModalOpen(false)}
      />
    </div>
  );
};
