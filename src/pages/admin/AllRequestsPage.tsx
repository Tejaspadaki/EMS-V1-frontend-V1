import React, { useEffect, useState } from 'react';
import { getAllRequestsAdmin, overrideRequestAdmin, type LeaveRequestData } from '../../api/requests.api';
import { StatusChip } from '../../components/ui/StatusChip';
import { TierProgress } from '../../components/requests/TierProgress';
import { RequestAuditTrail } from '../../components/requests/RequestAuditTrail';
import { ChevronDown, ChevronUp, ShieldAlert, Calendar, Briefcase } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { toast } from '../../utils/toast';

export const AllRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [overrideModal, setOverrideModal] = useState<{ open: boolean; reqId: string; action: string }>({ open: false, reqId: '', action: 'APPROVE' });
  const [overrideTargetTier, setOverrideTargetTier] = useState<number>(4);

  useEffect(() => {
    getAllRequestsAdmin().then(data => {
      setRequests(data);
      setLoading(false);
    });
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const executeOverride = async () => {
    try {
      const actionPayload = overrideModal.action === 'REASSIGN' ? 'APPROVE' : overrideModal.action;
      const tierPayload = overrideModal.action === 'REASSIGN' ? overrideTargetTier : undefined;

      await overrideRequestAdmin(overrideModal.reqId, actionPayload, tierPayload);
      
      // Optimistic update
      setRequests(prev => prev.map(req => {
        if (req.id === overrideModal.reqId) {
          const newStatus = overrideModal.action === 'APPROVE' ? 'Active' : overrideModal.action === 'REJECT' ? 'Inactive' : 'Pending';
          return {
            ...req,
            status: newStatus,
            currentTier: overrideModal.action === 'REASSIGN' ? overrideTargetTier : req.currentTier,
            auditTrail: [
              ...req.auditTrail,
              {
                id: Math.random().toString(),
                actorName: 'Super Admin',
                actorRole: 'Super Admin',
                action: overrideModal.action as any,
                timestamp: new Date().toISOString(),
                isOverride: true
              }
            ]
          };
        }
        return req;
      }));
      setOverrideModal({ open: false, reqId: '', action: 'APPROVE' });
    } catch (err) {
      toast.error('Override failed');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div></div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">System-Wide Requests</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Super Admin Overview</p>
        </div>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="ems-card p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">No Requests Found</h3>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mt-2">
              There are currently no system-wide leave or WFH requests in the system. All requests will appear here for super admin oversight.
            </p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="ems-card overflow-hidden transition-all">
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
                  
                  <StatusChip 
                    variant={req.status === 'Active' ? 'active' : req.status === 'Inactive' ? 'inactive' : 'pending'} 
                    label={req.status} 
                  />

                  <div className="flex items-center gap-2 pl-4 border-l border-[var(--color-border)]">
                    <button 
                      onClick={() => setOverrideModal({ open: true, reqId: req.id, action: 'APPROVE' })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-canvas)] transition-colors text-sm font-medium"
                    >
                      <ShieldAlert size={14} />
                      Override
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
          ))
        )}
      </div>

      <Modal isOpen={overrideModal.open} onClose={() => setOverrideModal({ ...overrideModal, open: false })} title="Super Admin Override">
        <div className="p-2">
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            You are about to override request <span className="font-bold">{overrideModal.reqId}</span>. This action bypasses standard tier approvals and will be permanently logged in the audit trail.
          </p>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Force Action</label>
              <select 
                className="ems-input w-full"
                value={overrideModal.action}
                onChange={(e) => setOverrideModal({ ...overrideModal, action: e.target.value })}
              >
                <option value="APPROVE">Force Approve</option>
                <option value="REJECT">Force Reject</option>
                <option value="REASSIGN">Reassign Tier</option>
              </select>
            </div>
            
            {overrideModal.action === 'REASSIGN' && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Target Tier State</label>
                <select 
                  className="ems-input w-full"
                  value={overrideTargetTier}
                  onChange={(e) => setOverrideTargetTier(Number(e.target.value))}
                >
                  <option value={1}>Tier 1 (Team Lead)</option>
                  <option value={2}>Tier 2 (Dept Head)</option>
                  <option value={3}>Tier 3 (HR)</option>
                  <option value={4}>Tier 4 (Fully Processed)</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setOverrideModal({ ...overrideModal, open: false })}>Cancel</Button>
            <Button variant="primary" onClick={executeOverride}>Execute Override</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
