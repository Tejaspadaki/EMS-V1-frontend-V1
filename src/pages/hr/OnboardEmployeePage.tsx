import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { onboardEmployee } from '../../api/hr.api';
import { getAllUsers } from '../../api/admin.api';
import { type Department, getAllDepartments } from '../../api/department.api';
import { Copy, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from '../../utils/toast';

export const OnboardEmployeePage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: 'EMPLOYEE',
    reportingManagerId: '',
    startDate: '',
    customPassword: '',
    phone: '',
    birthdate: '',
    subTeam: ''
  });
  const [managers, setManagers] = useState<any[]>([]);
  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [result, setResult] = useState<{ empId: string; qrCodeUrl?: string; tempPassword?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);

  useEffect(() => {
    // Fetch all users and departments
    getAllUsers().then(setManagers);
    getAllDepartments().then(deps => {
      setDepartmentsList(deps);
      if (deps.length > 0 && !formData.department) {
        setFormData(prev => ({ ...prev, department: deps[0].name }));
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await onboardEmployee(formData);
      setResult({
        empId: response?.empId || `EMP${Math.floor(1000 + Math.random() * 9000)}`,
        qrCodeUrl: response?.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example',
        tempPassword: response?.tempPassword || Math.random().toString(36).slice(-8) + '!'
      });
      setModalOpen(true);
      setCopied(false);
      setFormData({
        name: '',
        email: '',
        department: '',
        role: 'EMPLOYEE',
        reportingManagerId: '',
        startDate: '',
        customPassword: '',
        phone: '',
        birthdate: '',
        subTeam: ''
      });
    } catch (error) {
      toast.error('Failed to onboard employee');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.tempPassword) {
      navigator.clipboard.writeText(result.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    // Erase the temp password from memory when closed so it's never displayed again
    setResult(null); 
    setShowModalPassword(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Onboard New Employee</h2>
      
      <div className="ems-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Full Name</label>
              <Input name="name" required value={formData.name} onChange={handleChange} placeholder="Jane Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Email</label>
              <Input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="jane@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Department</label>
              <Select name="department" required value={formData.department} onChange={handleChange}>
                <option value="">Select Department</option>
                {departmentsList.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Role</label>
              <Select name="role" value={formData.role} onChange={handleChange}>
                <option value="EMPLOYEE">Employee</option>
                <option value="INTERN">Intern</option>
                <option value="TEAM_LEAD">Team Lead</option>
                <option value="DEPT_HEAD">Department Head</option>
                <option value="HR">HR</option>
                <option value="CEO">CEO</option>
                <option value="CTO">CTO</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Start Date</label>
              <Input type="date" name="startDate" required value={formData.startDate} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Reporting Manager</label>
              <Select name="reportingManagerId" value={formData.reportingManagerId} onChange={handleChange}>
                <option value="">None / Select Manager</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.name || m.email} ({m.role})</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Phone Number</label>
              <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+1234567890" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Birthdate</label>
              <Input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Sub-Team</label>
              <Input name="subTeam" value={formData.subTeam} onChange={handleChange} placeholder="e.g. Frontend, Backend" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Temporary Password</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  name="customPassword" 
                  value={formData.customPassword} 
                  onChange={handleChange} 
                  placeholder="Set a password (min 6 chars)" 
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Processing...' : 'Onboard Employee'}
            </Button>
          </div>
        </form>
      </div>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Employee Onboarded Successfully">
        <div className="flex flex-col items-center justify-center p-2 text-center space-y-4">
          <div className="text-sm text-[var(--color-text-secondary)]">Auto-generated EMP ID</div>
          <div className="text-2xl font-bold tracking-wider text-[var(--color-primary)]">{result?.empId}</div>
          
          <div className="border border-[var(--color-border)] p-2 rounded-lg bg-white mt-2">
            <img src={result?.qrCodeUrl} alt="Employee QR Code" className="w-24 h-24 object-contain" />
          </div>
          
          <div className="w-full bg-[var(--color-status-pending-bg)] p-4 rounded-lg border border-[var(--color-status-pending-text)] mt-4">
            <div className="text-sm font-semibold text-[var(--color-status-pending-text)] mb-2">Temporary Password</div>
            <div className="flex items-center justify-between bg-white px-3 py-2 rounded border border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <code className="font-mono text-lg tracking-wider font-bold">
                  {showModalPassword ? result?.tempPassword : '••••••••'}
                </code>
                <button
                  type="button"
                  onClick={() => setShowModalPassword(!showModalPassword)}
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors p-1"
                  title={showModalPassword ? "Hide Password" : "Show Password"}
                >
                  {showModalPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button 
                onClick={handleCopy}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors p-1"
                title="Copy Password"
              >
                {copied ? <CheckCircle size={20} className="text-[var(--color-status-active-text)]" /> : <Copy size={20} />}
              </button>
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] mt-2 italic text-left text-[var(--color-status-inactive-text)]">
              Warning: This password will only be shown once. Please copy and securely share it with the employee.
            </div>
          </div>

          <Button 
            variant="accent" 
            fullWidth 
            onClick={handleCloseModal}
            className="mt-2"
          >
            I have copied the password
          </Button>
        </div>
      </Modal>
    </div>
  );
};
