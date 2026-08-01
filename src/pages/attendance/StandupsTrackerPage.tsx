import React, { useEffect, useState } from 'react';
import { getStandups, excuseStandup, type StandupRecord } from '../../api/attendance.api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { AlertTriangle, Calendar, Check, X, Info } from 'lucide-react';
import { toast } from '../../utils/toast';

export const StandupsTrackerPage: React.FC = () => {
  const [records, setRecords] = useState<StandupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [excuseModal, setExcuseModal] = useState({ open: false, date: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchStandups = async () => {
    try {
      const data = await getStandups();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load standups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandups();
  }, []);

  const unexcusedMisses = records.filter(
    r => r.status === 'Missed' || r.status === 'MISSED' || r.status === 'absent'
  ).length;
  const showWarning = unexcusedMisses >= 3;

  const handleExcuseSubmit = async () => {
    if (!excuseModal.date || !excuseModal.reason) return;
    setSubmitting(true);
    try {
      await excuseStandup(excuseModal.date, excuseModal.reason);
      toast.success('Absence excuse submitted successfully!');
      setExcuseModal({ open: false, date: '', reason: '' });
      await fetchStandups();
    } catch (err) {
      toast.error('Failed to submit excuse');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Standups Tracker</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Review your daily standup attendance history.</p>
        </div>
        <Button variant="primary" onClick={() => setExcuseModal({ open: true, date: '', reason: '' })}>
          Intimate Absence
        </Button>
      </div>

      {showWarning && (
        <div className="mb-6 p-4 rounded-lg bg-[var(--color-status-inactive-bg)] border border-[#C62828] flex items-start gap-3 shadow-sm">
          <AlertTriangle className="text-[var(--color-status-inactive-text)] shrink-0 mt-0.5" size={24} />
          <div>
            <h4 className="font-bold text-[var(--color-status-inactive-text)] text-lg">Warning: Excessive Misses</h4>
            <p className="text-sm text-[var(--color-status-inactive-text)] mt-1 font-medium">
              You have accumulated {unexcusedMisses} unexcused standup misses. Please contact your Team Lead immediately to resolve this, or further disciplinary action may be taken automatically.
            </p>
          </div>
        </div>
      )}

      <div className="ems-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--color-text-secondary)]">
            <thead className="bg-gray-50 border-b border-[var(--color-border)] text-[var(--color-text-primary)]">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => {
                const isAttended = record.status === 'Attended' || record.status === 'PRESENT' || record.status === 'present';
                const isMissed = record.status === 'Missed' || record.status === 'MISSED' || record.status === 'absent';
                const isExcused = record.status === 'Excused' || record.status === 'EXCUSED' || record.status === 'excused';

                return (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <Calendar size={16} />
                      {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                        ${isAttended ? 'bg-[var(--color-status-active-bg)] text-[var(--color-status-active-text)] border-[#2E7D32]/20' : 
                          isMissed ? 'bg-[var(--color-status-inactive-bg)] text-[var(--color-status-inactive-text)] border-[#C62828]/20' : 
                          isExcused ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          'bg-gray-100 text-gray-700 border-gray-300'}
                      `}>
                        {isAttended ? <Check size={12} /> : isMissed ? <X size={12} /> : <Info size={12} />}
                        {isAttended ? 'Attended' : isMissed ? 'Missed' : isExcused ? 'Excused' : record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 italic text-xs">
                      {record.notes || (isExcused ? 'Pre-excused (Intimate Absence)' : '-')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={excuseModal.open} onClose={() => setExcuseModal({ ...excuseModal, open: false })} title="Intimate Absence">
        <div className="p-2 space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Pre-excuse an upcoming standup if you have a valid reason (e.g., approved leave, client meeting).
          </p>
          
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Standup Date</label>
            <input 
              type="date"
              className="ems-input w-full"
              value={excuseModal.date}
              onChange={(e) => setExcuseModal({ ...excuseModal, date: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Reason</label>
            <textarea 
              className="ems-input w-full min-h-[100px]"
              placeholder="Provide a valid reason..."
              value={excuseModal.reason}
              onChange={(e) => setExcuseModal({ ...excuseModal, reason: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setExcuseModal({ ...excuseModal, open: false })}>Cancel</Button>
            <Button variant="primary" disabled={submitting || !excuseModal.date || !excuseModal.reason} onClick={handleExcuseSubmit}>
              {submitting ? 'Submitting...' : 'Submit Excuse'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
