import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { getMyOnboardingChecklist } from '../../api/hr.api';
import { FaceEnrollmentModal } from '../../components/hr/FaceEnrollmentModal';
import { CheckCircle, Circle, FileText, Camera, Loader, AlertCircle } from 'lucide-react';

export const OnboardingDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [checklist, setChecklist] = useState<any>(null);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchChecklist = async () => {
    setLoading(true);
    try {
      const res = await getMyOnboardingChecklist();
      setChecklist(res.data);
      setStatus(res.status);
    } catch (err: any) {
      setError('Failed to load onboarding status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklist();
  }, []);

  const handleSubmitDocs = () => {
    navigate('/documents/me');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 mb-8">
        <AlertCircle size={20} />
        <p>{error}</p>
      </div>
    );
  }

  if (status !== 'PENDING') {
    return null; // Don't show anything if they aren't pending
  }

  const isDocsCollected = checklist?.documentsCollected;
  const isFaceEnrolled = checklist?.faceEnrolmentDone;

  return (
    <div className="bg-white rounded-xl shadow-card border border-indigo-100 p-6 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -z-10" />
      
      <h2 className="text-xl font-bold text-slate-900 mb-2">Welcome to EMS! Let's get you onboarded.</h2>
      <p className="text-slate-500 mb-6 text-sm">Please complete the following steps to finalize your account setup.</p>
      
      <div className="space-y-4">
        {/* Document Submission Step */}
        <div className={`flex items-center gap-4 p-4 rounded-xl border ${isDocsCollected ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
          <div className="shrink-0">
            {isDocsCollected ? <CheckCircle className="text-emerald-500" size={24} /> : <Circle className="text-slate-300" size={24} />}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${isDocsCollected ? 'text-emerald-700' : 'text-slate-800'}`}>1. Submit Documents</h3>
            <p className="text-sm text-slate-500 mt-0.5">Please provide your ID and joining documents.</p>
          </div>
          {!isDocsCollected && (
            <button
              onClick={handleSubmitDocs}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <FileText size={16} />
              Submit Documents
            </button>
          )}
        </div>

        {/* Face Enrollment Step */}
        <div className={`flex items-center gap-4 p-4 rounded-xl border ${isFaceEnrolled ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
          <div className="shrink-0">
            {isFaceEnrolled ? <CheckCircle className="text-emerald-500" size={24} /> : <Circle className="text-slate-300" size={24} />}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${isFaceEnrolled ? 'text-emerald-700' : 'text-slate-800'}`}>2. Face Enrollment</h3>
            <p className="text-sm text-slate-500 mt-0.5">Enroll your face for face attendance tracking.</p>
          </div>
          {!isFaceEnrolled && (
            <button
              onClick={() => setIsFaceModalOpen(true)}
              disabled={!isDocsCollected}
              title={!isDocsCollected ? 'Please submit documents first' : ''}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${!isDocsCollected ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-sky-500 text-white hover:bg-sky-600'}`}
            >
              <Camera size={16} />
              Enroll Face
            </button>
          )}
        </div>
      </div>

      {user && (
        <FaceEnrollmentModal
          isOpen={isFaceModalOpen}
          onClose={() => setIsFaceModalOpen(false)}
          employeeId={user.id}
          onSuccess={() => {
            setIsFaceModalOpen(false);
            fetchChecklist();
          }}
        />
      )}
    </div>
  );
};
