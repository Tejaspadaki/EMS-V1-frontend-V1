import React, { useEffect, useState } from 'react';
import { getMyRequests, type LeaveRequestData, deleteLeaveRequest } from '../../api/requests.api';
import { StatusChip } from '../../components/ui/StatusChip';
import { TierProgress } from '../../components/requests/TierProgress';
import { Calendar, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { RequestAuditTrail } from '../../components/requests/RequestAuditTrail';
import { toast } from '../../utils/toast';

export const MyRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getMyRequests()
      .then(data => {
        if (isMounted) setRequests(data);
      })
      .catch(err => {
        console.error('Error fetching my requests:', err);
        toast.error('Failed to load your requests');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) return;
    try {
      await deleteLeaveRequest(id);
      const data = await getMyRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete request.');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">My Requests</h2>
      </div>

      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req.id} className="ems-card overflow-hidden transition-all">
            <div 
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50"
              onClick={() => toggleExpand(req.id)}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${req.type === 'Leave' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                  {req.type === 'Leave' ? <Calendar size={20} /> : <Briefcase size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-text-primary)]">{req.type} Request</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                    {req.startDate} {req.endDate ? `to ${req.endDate}` : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Approval Progress</span>
                  <TierProgress currentTier={req.currentTier} status={req.status} auditTrail={req.auditTrail} mode="inline" />
                </div>
                
                <StatusChip 
                  variant={req.status === 'Active' ? 'active' : req.status === 'Inactive' ? 'inactive' : 'pending'} 
                  label={req.status} 
                />
                
                <button className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
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
                      {req.status === 'Pending' && (
                        <div className="pt-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(req.id); }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold px-3 py-1.5 rounded-lg text-xs border border-rose-200 transition-colors shadow-sm"
                          >
                            Cancel Request
                          </button>
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
            You haven't submitted any requests yet.
          </div>
        )}
      </div>
    </div>
  );
};
