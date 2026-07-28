import React from 'react';
import { type RequestAudit } from '../../api/requests.api';
import { Shield } from 'lucide-react';

export const RequestAuditTrail: React.FC<{ auditTrail: RequestAudit[] }> = ({ auditTrail }) => {
  if (!auditTrail || auditTrail.length === 0) {
    return <div className="text-sm text-[var(--color-text-secondary)] italic">No actions recorded yet.</div>;
  }

  return (
    <div className="space-y-3 mt-2">
      {auditTrail.map((audit) => (
        <div key={audit.id} className="flex items-start gap-3 text-sm">
          <div className="mt-0.5 shrink-0">
            {audit.isOverride ? (
              <div className="p-1 rounded-full bg-red-100 text-red-600">
                <Shield size={14} />
              </div>
            ) : (
              <div className="w-2 h-2 mt-1.5 rounded-full bg-[var(--color-border)]" />
            )}
          </div>
          <div className="flex-1 border-l-2 border-[var(--color-border)] pl-4 -ml-[13px]">
            <div className="font-medium text-[var(--color-text-primary)]">
              {audit.action} by {audit.actorName} <span className="text-[var(--color-text-secondary)] font-normal">({audit.actorRole})</span>
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {new Date(audit.timestamp).toLocaleString()}
            </div>
            {audit.isOverride && (
              <div className="text-xs font-medium text-red-600 mt-1 flex items-center gap-1">
                Overridden by Super Admin
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
