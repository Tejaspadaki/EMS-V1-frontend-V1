import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Send, AlertCircle, Loader, X, Mail } from 'lucide-react';
import type { EmployeeOnboardingData } from './OnboardingCard';
import { sendOnboardingEmail } from '../../api/hr.api';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeOnboardingData;
  onSuccess: () => void;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({ isOpen, onClose, employee, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultTemplate = `Hi ${employee.name},

Welcome to the team! We are thrilled to have you join us as a ${employee.role} in the ${employee.department} department.

To get started, please log in to your employee portal and complete your onboarding tasks (including document submission and face enrollment).
Access your portal here: http://localhost:5173/login
Your temporary password is: {{TEMP_PASSWORD}}

If you have any questions, feel free to reach out to your buddy or HR.

Best regards,
Human Resources`;

  const [message, setMessage] = useState(defaultTemplate);

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    try {
      await sendOnboardingEmail(employee.id, message);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to send email.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Mail className="text-[var(--color-primary)]" size={20} />
            <h2 className="text-lg font-bold text-slate-900">Send Onboarding Details</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Email Template</label>
            <textarea
              className="w-full h-64 p-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500">
            This email will be sent to the employee's registered email address with all necessary onboarding instructions. <br/>
            <strong>Note:</strong> Leave <code>{'{{TEMP_PASSWORD}}'}</code> in the template to automatically generate and send a new temporary password.
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="accent" 
            onClick={handleSend}
            disabled={loading || !message.trim()}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader size={16} className="animate-spin" />
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send size={16} />
                Send Email
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
