import React, { useState, useEffect } from 'react';
import { onboardEmployee } from '../../api/hr.api';
import { getAllUsers } from '../../api/admin.api';
import { type Department, getAllDepartments } from '../../api/department.api';
import { 
  UserPlus, Sparkles, Copy, CheckCircle2, Eye, EyeOff, User, Mail, 
  Phone, Calendar, Building2, Briefcase, Layers, Lock, AlertCircle, Check 
} from 'lucide-react';
import { toast } from '../../utils/toast';

export const OnboardEmployeePage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: 'EMPLOYEE',
    reportingManagerId: '',
    startDate: new Date().toISOString().split('T')[0],
    customPassword: '',
    phone: '',
    birthdate: '',
    subTeam: ''
  });
  
  const [managers, setManagers] = useState<any[]>([]);
  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [result, setResult] = useState<{ empId: string; qrCodeUrl?: string; tempPassword?: string; email?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);

  useEffect(() => {
    getAllUsers().then(setManagers).catch(console.error);
    getAllDepartments().then(deps => {
      setDepartmentsList(deps);
      if (deps.length > 0 && !formData.department) {
        setFormData(prev => ({ ...prev, department: deps[0].name }));
      }
    }).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, customPassword: pass }));
    setShowPassword(true);
    toast.success('Generated strong temporary password!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customPassword || formData.customPassword.length < 6) {
      setErrorMsg('Temporary password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const response = await onboardEmployee(formData);
      const tempPass = formData.customPassword || response?.tempPassword || 'Pass' + Math.floor(1000 + Math.random() * 9000) + '!';
      
      setResult({
        empId: response?.empId || response?.user?.empId || `EMP-${Date.now()}`,
        qrCodeUrl: response?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${response?.empId || 'EMS'}`,
        tempPassword: tempPass,
        email: formData.email
      });

      setModalOpen(true);
      setCopied(false);
      setCopiedAll(false);
      
      toast.success(`Successfully onboarded ${formData.name}!`);

      // Reset form
      setFormData({
        name: '',
        email: '',
        department: departmentsList[0]?.name || '',
        role: 'EMPLOYEE',
        reportingManagerId: '',
        startDate: new Date().toISOString().split('T')[0],
        customPassword: '',
        phone: '',
        birthdate: '',
        subTeam: ''
      });
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to onboard employee';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    if (result?.tempPassword) {
      navigator.clipboard.writeText(result.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyAllCredentials = () => {
    if (result) {
      const text = `EMS Portal Login Credentials:\nEmail: ${result.email}\nTemporary Password: ${result.tempPassword}\nEmployee ID: ${result.empId}`;
      navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setResult(null);
    setShowModalPassword(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6 animate-fade-in pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-white/15 rounded-2xl backdrop-blur-md border border-white/20">
              <UserPlus size={32} className="text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Onboard New Employee</h1>
              <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-lg">
                Create user profile, assign department roles, auto-generate credentials, and initialize onboarding checklist.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium flex items-center gap-3 animate-fade-in">
              <AlertCircle size={20} className="shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Personal Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <User size={18} className="text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Jane Smith"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                  />
                  <User size={18} className="absolute left-3.5 top-3 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. jane.smith@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                  />
                  <Mail size={18} className="absolute left-3.5 top-3 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +1 (555) 123-4567"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                  />
                  <Phone size={18} className="absolute left-3.5 top-3 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                  />
                  <Calendar size={18} className="absolute left-3.5 top-3 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Department & Organizational Placement */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Building2 size={18} className="text-purple-600" />
              <h3 className="text-base font-bold text-slate-900">Organizational Placement & Role</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                >
                  <option value="">Select Department</option>
                  {departmentsList.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Assigned Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="INTERN">Intern</option>
                  <option value="TEAM_LEAD">Team Lead</option>
                  <option value="DEPT_HEAD">Department Head</option>
                  <option value="HR">HR</option>
                  <option value="CEO">CEO</option>
                  <option value="CTO">CTO</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Reporting Manager
                </label>
                <select
                  name="reportingManagerId"
                  value={formData.reportingManagerId}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                >
                  <option value="">None / Select Manager</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>{m.name || m.email} ({m.role})</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Sub-Team / Project Group
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="subTeam"
                    value={formData.subTeam}
                    onChange={handleChange}
                    placeholder="e.g. Frontend Core, Mobile Engineering, Operations"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                  />
                  <Layers size={18} className="absolute left-3.5 top-3 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Credentials & Security */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Lock size={18} className="text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Security Credentials</h3>
              </div>

              <button
                type="button"
                onClick={generateRandomPassword}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Sparkles size={14} />
                Auto-Generate
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Temporary Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="customPassword"
                  required
                  value={formData.customPassword}
                  onChange={handleChange}
                  placeholder="Set temp password (min 6 characters)"
                  className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                />
                <Lock size={18} className="absolute left-3.5 top-3 text-slate-400" />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              <UserPlus size={18} />
              {loading ? 'Processing Onboarding...' : 'Onboard Employee'}
            </button>
          </div>

        </form>
      </div>

      {/* Success Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden animate-scale-in">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 text-white text-center relative">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle2 size={32} className="text-emerald-300" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">Employee Onboarded!</h3>
              <p className="text-xs text-indigo-100 mt-1">Credentials and access provisioned successfully</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-center">
              
              {/* EMP ID & QR */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Employee ID</p>
                <p className="text-2xl font-black text-indigo-600 font-mono tracking-wider">{result?.empId}</p>

                {result?.qrCodeUrl && (
                  <div className="w-28 h-28 bg-white p-2 border border-slate-200 rounded-xl mx-auto shadow-xs">
                    <img src={result.qrCodeUrl} alt="QR Access" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              {/* Password Box */}
              <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl text-left space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Temporary Password</p>
                <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-amber-200/80 shadow-2xs">
                  <code className="font-mono text-base font-bold text-slate-900 tracking-wider">
                    {showModalPassword ? result?.tempPassword : '••••••••••••'}
                  </code>
                  
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title={showModalPassword ? "Hide" : "Show"}
                    >
                      {showModalPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="p-1.5 text-indigo-600 hover:text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1 text-xs font-bold"
                      title="Copy Password"
                    >
                      {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-amber-700 italic">
                  Note: Share this password with the employee so they can complete initial login.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCopyAllCredentials}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedAll ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  {copiedAll ? 'Credentials Copied!' : 'Copy Full Login Credentials'}
                </button>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Done & Close
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
