import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getEmployeeDetails, generateRoleCard, regenerateRoleCard, exportRoleCardPDF, type EmployeeDetails } from '../../api/employees.api';
import { getInitials } from '../../utils/initials';
import { ContributionGauge } from '../../components/analytics/ContributionGauge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Download, Fingerprint, Shield, Clock, ShieldAlert, Camera, LayoutDashboard, Settings as SettingsIcon, Mail, Briefcase, MapPin, Phone, AlertTriangle, Calendar } from 'lucide-react';
import { useFaceApi } from '../../hooks/useFaceApi';
import { enrollFace } from '../../api/attendance.api';
import { performanceApi } from '../../api/performance.api';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';

export const EmployeeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { role, user } = useAuthStore();
  const [employee, setEmployee] = useState<EmployeeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'rolecard' | 'audit' | 'attendance' | 'settings'>('overview');

  // Modals
  const [generateModal, setGenerateModal] = useState(false);
  const [regenerateModal, setRegenerateModal] = useState(false);
  const [regenConfirm, setRegenConfirm] = useState(false);
  
  // Actions state
  const [actionLoading, setActionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Face Enrollment
  const [enrollModal, setEnrollModal] = useState(false);
  const { isLoaded: faceApiLoaded, detectFaceAndGetDescriptor } = useFaceApi();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const [enrollStatus, setEnrollStatus] = useState<string>('');

  // Performance Review
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ review_period: '', rating: 5, kpi_score: 100, feedback: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const loadData = async () => {
    if (!id) return;
    const data = await getEmployeeDetails(id);
    setEmployee(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSubmitReview = async () => {
    if (!id) return;
    setReviewSubmitting(true);
    try {
      await performanceApi.submitReview({
        user_id: parseInt(id),
        ...reviewData
      });
      setReviewModal(false);
      setReviewData({ review_period: '', rating: 5, kpi_score: 100, feedback: '' });
      loadData(); // refresh data just in case
    } catch (err) {
      console.error(err);
      alert('Failed to submit review');
    }
    setReviewSubmitting(false);
  };

  const handleGenerate = async () => {
    if (!id) return;
    setActionLoading(true);
    await generateRoleCard(id);
    setActionLoading(false);
    setGenerateModal(false);
    loadData();
  };

  const handleRegenerate = async () => {
    if (!id) return;
    setActionLoading(true);
    await regenerateRoleCard(id);
    setActionLoading(false);
    setRegenerateModal(false);
    setRegenConfirm(false);
    loadData();
  };

  const handleExportPDF = async () => {
    if (!id) return;
    setExportLoading(true);
    setExportError(null);
    try {
      const { url } = await exportRoleCardPDF(id);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RoleCard_${employee?.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      if (err.message === 'rate_limit') {
        setExportError("You've hit the export limit, try again in a minute.");
      } else {
        setExportError("Failed to export PDF.");
      }
    } finally {
      setExportLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      setEnrollStatus('Camera access denied or unavailable.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleEnrollFace = async () => {
    if (!videoRef.current || !id) return;
    
    setEnrollStatus('Detecting face...');
    setActionLoading(true);
    try {
      const descriptor = await detectFaceAndGetDescriptor(videoRef.current);
      if (!descriptor) {
        setEnrollStatus('No face detected. Please look directly at the camera.');
        setActionLoading(false);
        return;
      }

      setEnrollStatus('Saving biometric data...');
      await enrollFace({ employeeId: id, faceDescriptor: descriptor });
      
      setEnrollStatus('Face enrolled successfully!');
      setTimeout(() => {
        setEnrollModal(false);
        stopCamera();
        setEnrollStatus('');
      }, 2000);
    } catch (err: any) {
      setEnrollStatus('Error: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  if (!employee) {
    return <div className="p-8 text-center text-gray-500 font-semibold text-lg">Employee not found.</div>;
  }

  const isSuperAdmin = role === 'Super Admin';
  const hasRoleCard = employee.roleCardGenerated;

  const tabStyles = (tabName: string) => `
    flex items-center gap-2 px-6 py-3.5 font-bold text-sm rounded-t-xl transition-all duration-300 cursor-pointer
    ${activeTab === tabName 
      ? 'bg-white/80 backdrop-blur-md text-indigo-700 shadow-[0_-4px_15px_rgba(0,0,0,0.02)] border-t border-x border-white/60 relative z-10' 
      : 'text-gray-500 hover:bg-white/40 hover:text-indigo-500'}
  `;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12 h-[calc(100vh-8rem)] overflow-y-auto pr-2">
      
      {/* Premium Hero Header */}
      <div className="relative bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mt-4">
        {/* Cover Photo / Banner */}
        <div className="h-40 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-indigo-900/20 blur-3xl"></div>
        </div>
        
        <div className="px-8 pb-8 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-white text-indigo-600 rounded-full flex items-center justify-center text-4xl font-extrabold shadow-xl border-4 border-white/80 ring-4 ring-indigo-500/10 shrink-0">
              {getInitials(employee.name)}
            </div>
            <div className="text-center md:text-left pt-16 md:pt-0">
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight">
                {employee.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3 text-sm font-semibold">
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 shadow-sm flex items-center gap-2">
                  <Briefcase size={16} /> {employee.role}
                </span>
                <span className="px-4 py-1.5 bg-purple-50 text-purple-700 rounded-full border border-purple-100 shadow-sm">
                  {employee.department}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex gap-4 items-center mb-2">
            {employee.id === user?.id && (
              <Button variant="secondary" className="shadow-md bg-white border border-gray-100 hover:border-indigo-200 transition-all text-gray-700" onClick={() => setActiveTab('settings')}>
                <SettingsIcon size={16} className="mr-2" /> Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-end border-b-2 border-indigo-50/50 pt-2 px-4 gap-1">
        <button onClick={() => setActiveTab('overview')} className={tabStyles('overview')}>
          <LayoutDashboard size={18} /> Overview
        </button>
        <button onClick={() => setActiveTab('rolecard')} className={tabStyles('rolecard')}>
          <Fingerprint size={18} /> Digital Role Card
        </button>
        <button onClick={() => setActiveTab('audit')} className={tabStyles('audit')}>
          <Shield size={18} /> Security Audit
        </button>
        <button onClick={() => setActiveTab('attendance')} className={tabStyles('attendance')}>
          <Calendar size={18} /> Attendance
        </button>
        {employee.id === user?.id && (
          <button onClick={() => setActiveTab('settings')} className={tabStyles('settings')}>
            <SettingsIcon size={18} /> Settings
          </button>
        )}
      </div>

      {/* Tab Content Area */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 min-h-[400px] transition-all">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600"><SettingsIcon size={18} /></div>
                  Personal Information
                </h3>
                <div className="bg-white/80 p-6 rounded-2xl border border-white/60 shadow-sm space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-500 shrink-0"><Mail size={18} /></div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email Address</p>
                      <p className="text-sm font-semibold text-gray-800">{employee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-500 shrink-0"><Phone size={18} /></div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Phone Number</p>
                      <p className="text-sm font-semibold text-gray-800">+1 (555) 000-0000 <span className="text-xs font-normal text-gray-400 italic">(Mock)</span></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-rose-50 rounded-xl text-rose-500 shrink-0"><MapPin size={18} /></div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Location</p>
                      <p className="text-sm font-semibold text-gray-800">Headquarters, NY <span className="text-xs font-normal text-gray-400 italic">(Mock)</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600"><LayoutDashboard size={18} /></div>
                  Performance Metrics
                </div>
                {['SUPER_ADMIN', 'HR', 'DEPT_HEAD', 'TEAM_LEAD', 'CEO', 'CTO', 'HR / Admin Executive', 'Executive', 'Super Admin'].includes(role || '') && (
                  <Button size="sm" onClick={() => setReviewModal(true)}>Add Review</Button>
                )}
              </h3>
              <div className="bg-white/80 p-6 rounded-2xl border border-white/60 shadow-sm h-64 flex items-center justify-center">
                <ContributionGauge score={employee.contributionScore} isGenerated={hasRoleCard} />
              </div>
            </div>
          </div>
        )}

        {/* ROLE CARD TAB */}
        {activeTab === 'rolecard' && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">Digital Role Card</h3>
                <p className="text-sm text-gray-500 mt-1">Manage physical and digital access credentials.</p>
              </div>
              <div className="flex gap-3">
                {hasRoleCard && (
                  <div className="flex items-center gap-2">
                    {exportError && <span className="text-xs text-[#C62828] font-bold px-3 bg-[#FFEBEE] rounded-lg py-2 animate-pulse shadow-sm border border-red-100">{exportError}</span>}
                    <Button 
                      variant="secondary" 
                      onClick={handleExportPDF} 
                      disabled={exportLoading}
                      className="bg-white shadow-sm border border-gray-200 text-gray-700 hover:border-indigo-300"
                    >
                      {exportLoading ? <div className="w-4 h-4 rounded-full border-2 border-t-indigo-600 border-r-indigo-600 border-b-transparent border-l-transparent animate-spin mr-2" /> : <Download size={16} className="mr-2 text-indigo-600" />}
                      Export PDF
                    </Button>
                  </div>
                )}
                
                {(isSuperAdmin || role === 'HR') && (
                  <Button variant="outline" onClick={() => { setEnrollModal(true); startCamera(); }} className="border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100">
                    <Camera size={16} className="mr-2" /> Enroll Face
                  </Button>
                )}
                
                {isSuperAdmin && (
                  hasRoleCard ? (
                    <Button variant="ghost" onClick={() => setRegenerateModal(true)} className="text-gray-500 hover:bg-gray-100">
                      Regenerate
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={() => setGenerateModal(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
                      Generate Role Card
                    </Button>
                  )
                )}
              </div>
            </div>

            {hasRoleCard ? (
              <div className="bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100 rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col items-center text-center max-w-lg mx-auto relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="w-32 h-32 bg-white border-[6px] border-white rounded-2xl flex items-center justify-center mb-8 shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden ring-1 ring-black/5">
                  {employee.roleCardQrCodeUrl ? (
                    <img src={employee.roleCardQrCodeUrl} alt="QR Code" className="w-full h-full object-cover" />
                  ) : (
                    <Fingerprint size={48} className="text-indigo-600 opacity-20" />
                  )}
                </div>
                
                <h4 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">{employee.name}</h4>
                <span className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-black rounded-full uppercase tracking-widest mb-6 shadow-md shadow-indigo-200">
                  {employee.role}
                </span>
                
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4"></div>
                
                <p className="text-xs font-mono text-gray-400 tracking-[0.2em] uppercase font-bold">
                  ID: {employee.id}
                </p>
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-300">
                <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mb-6">
                  <ShieldAlert size={36} className="text-gray-300" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Role Card not generated</h4>
                <p className="text-gray-500 text-sm mt-2 max-w-sm">
                  This employee's digital profile and QR access have not been initialized yet.
                </p>
                {isSuperAdmin && (
                  <Button variant="primary" onClick={() => setGenerateModal(true)} className="mt-8 shadow-md">
                    Generate Now
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* AUDIT TAB */}
        {activeTab === 'audit' && (
          <div className="animate-fade-in max-w-4xl mx-auto space-y-4">
            <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <Shield size={20} className="text-indigo-500" />
              Security Audit Trail
            </h3>
            
            <div className="bg-white/80 rounded-2xl border border-white/60 shadow-sm overflow-hidden">
              {employee.auditLog.length === 0 ? (
                <div className="p-12 text-center text-sm text-gray-500 font-medium">No security events found.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {employee.auditLog.map(log => (
                    <div key={log.id} className="p-5 flex items-start gap-5 hover:bg-gray-50/50 transition-colors">
                      <div className="mt-0.5 bg-indigo-50 p-2.5 rounded-xl text-indigo-500 shadow-sm border border-indigo-100/50">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{log.action}</p>
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mt-1.5">
                          <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-600">By {log.actor}</span>
                          <span className="text-gray-300">•</span>
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && employee.id === user?.id && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <h3 className="text-xl font-extrabold text-gray-900 mb-6">Profile Settings</h3>
            
            <div className="bg-indigo-50/50 border border-indigo-100 p-8 rounded-3xl text-center shadow-inner">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm text-indigo-500">
                <SettingsIcon size={32} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Settings are coming soon</h4>
              <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                You will soon be able to update your phone number, emergency contacts, passwords, and notification preferences from this panel.
              </p>
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <div className="animate-fade-in max-w-3xl mx-auto">
            <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-500" />
              Attendance Log
            </h3>
            
            <div className="bg-white/80 rounded-2xl border border-white/60 shadow-sm overflow-hidden">
              {(!employee.attendances || employee.attendances.length === 0) ? (
                <div className="p-12 text-center text-sm text-gray-500 font-medium">No attendance records found.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {employee.attendances.map(log => (
                    <div key={log.id} className="p-5 flex items-start gap-5 hover:bg-gray-50/50 transition-colors">
                      <div className={`mt-0.5 p-2.5 rounded-xl shadow-sm border ${log.type === 'check_in' ? 'bg-emerald-50 text-emerald-500 border-emerald-100/50' : 'bg-rose-50 text-rose-500 border-rose-100/50'}`}>
                        {log.type === 'check_in' ? <Clock size={16} /> : <Calendar size={16} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                          {log.type.replace('_', ' ')}
                        </p>
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mt-1.5">
                          <span className="text-gray-400">Date:</span>
                          <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-600">{new Date(log.date).toLocaleDateString()}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-400">Time:</span>
                          <span>{new Date(log.recordedAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Generation Modals */}
      <Modal isOpen={generateModal} onClose={() => setGenerateModal(false)} title="Generate Role Card">
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-600 font-medium leading-relaxed">
            This will provision a public QR profile and activate analytics tracking for <strong className="text-gray-900">{employee.name}</strong>.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setGenerateModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleGenerate} disabled={actionLoading} className="shadow-md">
              {actionLoading ? 'Generating...' : 'Confirm Generation'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={regenerateModal} onClose={() => { setRegenerateModal(false); setRegenConfirm(false); }} title="Regenerate Role Card">
        <div className="p-4 space-y-4">
          <div className="bg-rose-50 border border-rose-200 p-5 rounded-xl">
            <h4 className="text-rose-700 font-bold text-sm mb-2 flex items-center gap-2">
              <AlertTriangle size={18} /> Danger Zone
            </h4>
            <p className="text-xs text-rose-600 font-medium leading-relaxed">
              Regenerating this card will invalidate all previous QR codes and public links immediately. 
              Physical access cards tied to the old QR will stop working.
            </p>
          </div>
          
          <label className="flex items-start gap-3 mt-6 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <input 
              type="checkbox" 
              checked={regenConfirm}
              onChange={(e) => setRegenConfirm(e.target.checked)}
              className="mt-0.5 shrink-0 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm font-bold text-gray-700">
              I understand this will regenerate the existing Role Card and invalidate prior versions.
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button variant="ghost" onClick={() => { setRegenerateModal(false); setRegenConfirm(false); }}>Cancel</Button>
            <Button variant="primary" onClick={handleRegenerate} disabled={!regenConfirm || actionLoading} className="bg-rose-600 hover:bg-rose-700 shadow-md">
              {actionLoading ? 'Regenerating...' : 'Regenerate Card'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={enrollModal} onClose={() => { setEnrollModal(false); stopCamera(); setEnrollStatus(''); }} title="Enroll Biometric Face Data">
        <div className="p-5 space-y-5">
          <p className="text-sm text-gray-600 font-medium">
            Position the employee's face clearly in the camera view to capture their biometric descriptor for Check-In authentication.
          </p>
          
          <div className="relative bg-black rounded-2xl overflow-hidden h-72 flex items-center justify-center shadow-inner border border-gray-200">
            {!faceApiLoaded ? (
              <div className="flex flex-col items-center gap-3 text-white/70">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
                <span className="text-sm font-semibold tracking-wide">Loading ML Models...</span>
              </div>
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover scale-x-[-1]"
              />
            )}
            
            {/* Camera Frame overlay */}
            <div className="absolute inset-0 pointer-events-none border-[12px] border-black/20 z-10"></div>
          </div>

          {enrollStatus && (
            <div className={`p-4 rounded-xl text-sm text-center font-bold shadow-sm border ${enrollStatus.includes('successfully') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
              {enrollStatus}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setEnrollModal(false); stopCamera(); setEnrollStatus(''); }}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleEnrollFace} 
              disabled={actionLoading || !faceApiLoaded}
              className="flex items-center gap-2 shadow-md"
            >
              <Camera size={18} /> 
              {actionLoading ? 'Processing...' : 'Capture & Enroll'}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="Submit Performance Review">
        <div className="space-y-4 pt-4">
          <Input 
            label="Review Period (e.g. Q3 2026)" 
            value={reviewData.review_period} 
            onChange={(e: any) => setReviewData({...reviewData, review_period: e.target.value})} 
          />
          <Input 
            label="Rating (out of 5)" 
            type="number" 
            min="1" max="5" step="0.1" 
            value={reviewData.rating} 
            onChange={(e: any) => setReviewData({...reviewData, rating: parseFloat(e.target.value)})} 
          />
          <Input 
            label="KPI Score (0-100)" 
            type="number" 
            min="0" max="100" 
            value={reviewData.kpi_score} 
            onChange={(e: any) => setReviewData({...reviewData, kpi_score: parseInt(e.target.value)})} 
          />
          <Textarea 
            label="Feedback" 
            rows={4}
            value={reviewData.feedback} 
            onChange={(e: any) => setReviewData({...reviewData, feedback: e.target.value})} 
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setReviewModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitReview} isLoading={reviewSubmitting}>Submit Review</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
