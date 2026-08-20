import React, { useEffect, useState } from 'react';
import { getApprovalQueue, processRequest, type LeaveRequestData } from '../../api/requests.api';
import { useAuthStore } from '../../store/authStore';
import { StatusChip } from '../../components/ui/StatusChip';
import { TierProgress } from '../../components/requests/TierProgress';
import { RequestAuditTrail } from '../../components/requests/RequestAuditTrail';
import { ChevronDown, ChevronUp, Calendar, Briefcase, Check, X } from 'lucide-react';
import { toast } from '../../utils/toast';

export const ApprovalQueuePage: React.FC = () => {
  const { role } = useAuthStore();
  const [requests, setRequests] = useState<LeaveRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!role) {
      setLoading(false);
      return;
    }

    getApprovalQueue(role)
      .then(data => {
        setRequests(data);
      })
      .catch(error => {
        console.error('Failed to load approval queue:', error);
        toast.error('Unable to load approval queue. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [role]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await processRequest(id, action);
      // Optimistic remove
      setRequests(prev => prev.filter(req => req.id !== id));
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div></div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Approval Queue</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Viewing requests requiring your approval ({role})</p>
        </div>
      </div>

      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req.id} className="novynth-card overflow-hidden transition-all">
            <div className="p-4 flex items-center justify-between hover:bg-gray-50/50">
              <div 
                className="flex items-center gap-4 cursor-pointer flex-1"
                onClick={() => toggleExpand(req.id)}
              >
                <div className={`p-3 rounded-lg ${req.type === 'Leave' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                  {req.type === 'Leave' ? <Calendar size={20} /> : <Briefcase size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-text-primary)]">{req.employeeName}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                    {req.type} • {req.startDate} {req.endDate ? `to ${req.endDate}` : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end gap-1.5 hidden md:flex">
                  <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Approval Progress</span>
                  <TierProgress currentTier={req.currentTier} status={req.status} auditTrail={req.auditTrail} mode="inline" />
                </div>
                
                <StatusChip variant="pending" label={req.status} />

                <div className="flex items-center gap-2 pl-4 border-l border-[var(--color-border)]">
                  <button 
                    onClick={() => handleAction(req.id, 'reject')}
                    className="flex items-center justify-center p-2 rounded-md border border-[#C62828] text-[#C62828] hover:bg-[#FFEBEE] transition-colors"
                    title="Reject"
                  >
                    <X size={18} />
                  </button>
                  <button 
                    onClick={() => handleAction(req.id, 'approve')}
                    className="flex items-center justify-center p-2 rounded-md bg-[var(--color-accent)] text-white hover:brightness-110 transition-colors"
                    title="Approve"
                  >
                    <Check size={18} />
                  </button>
                </div>
                
                <button 
                  onClick={() => toggleExpand(req.id)}
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] p-1"
                >
                  {expandedId === req.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
            </div>

            {expandedId === req.id && (
              <div className="px-5 pb-5 pt-2 border-t border-[var(--color-border)] bg-gray-50/30 space-y-4">
                <div className="pt-2">
                  <TierProgress currentTier={req.currentTier} status={req.status} auditTrail={req.auditTrail} mode="detailed" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Request Details</h4>
                    <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                      <p><span className="font-medium text-gray-700">Request ID:</span> {req.id}</p>
                      {req.deliverables && (
                        <div>
                          <span className="font-medium text-gray-700 block mb-1">Deliverables:</span>
                          <p className="bg-white p-3 border border-[var(--color-border)] rounded-md whitespace-pre-wrap">{req.deliverables}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Audit Trail</h4>
                    <div className="bg-white p-4 border border-[var(--color-border)] rounded-md min-h-[100px]">
                      <RequestAuditTrail auditTrail={req.auditTrail} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {requests.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-secondary)] bg-white rounded-lg border border-[var(--color-border)]">
            No requests require your approval at this time.
          </div>
        )}
      </div>
    </div>
  );
};
