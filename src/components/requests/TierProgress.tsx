import React from 'react';
import { type RequestAudit, type RequestStatus } from '../../api/requests.api';
import { Check, X, Clock, Shield, UserCheck, ChevronRight } from 'lucide-react';

interface TierProgressProps {
  currentTier: number;
  status?: RequestStatus;
  auditTrail?: RequestAudit[];
  mode?: 'inline' | 'detailed';
}

const TIER_DEFINITIONS = [
  { tier: 1, name: 'Team Lead', roleName: 'Team Lead' },
  { tier: 2, name: 'Dept Head', roleName: 'Department Head' },
  { tier: 3, name: 'HR / Admin', roleName: 'HR & Admin' },
];

export const TierProgress: React.FC<TierProgressProps> = ({
  currentTier,
  status = 'Pending',
  auditTrail = [],
  mode = 'inline'
}) => {
  // Map audit logs to tiers
  const getTierInfo = (tierNum: number) => {
    const roleDef = TIER_DEFINITIONS[tierNum - 1];
    
    // Find audit log for this tier (either matching tier index or sequence)
    const auditEntry = auditTrail[tierNum - 1] || auditTrail.find(a => {
      const r = (a.actorRole || '').toLowerCase();
      if (tierNum === 1 && (r.includes('lead') || r.includes('tl'))) return true;
      if (tierNum === 2 && (r.includes('dept') || r.includes('head') || r.includes('manager'))) return true;
      if (tierNum === 3 && (r.includes('hr') || r.includes('admin') || r.includes('super'))) return true;
      return false;
    });

    let state: 'approved' | 'rejected' | 'pending' | 'waiting' = 'waiting';
    
    if (status === 'Inactive') {
      if (auditEntry?.action === 'Rejected') {
        state = 'rejected';
      } else if (currentTier > tierNum) {
        state = 'approved';
      } else {
        state = 'waiting';
      }
    } else if (status === 'Active') {
      state = 'approved';
    } else {
      // Pending
      if (currentTier > tierNum) {
        state = 'approved';
      } else if (currentTier === tierNum) {
        state = 'pending';
      } else {
        state = 'waiting';
      }
    }

    const approverName = auditEntry?.actorName;
    const approverRole = auditEntry?.actorRole || roleDef.roleName;
    const timestamp = auditEntry?.timestamp;
    const isOverride = auditEntry?.isOverride;

    return {
      tierNum,
      name: roleDef.name,
      roleName: roleDef.roleName,
      state,
      approverName,
      approverRole,
      timestamp,
      isOverride
    };
  };

  const tiers = [1, 2, 3].map(t => getTierInfo(t));

  if (mode === 'detailed') {
    return (
      <div className="w-full bg-white p-4 border border-[var(--color-border)] rounded-xl shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck size={15} className="text-indigo-600" /> Track Approval Progress
          </h4>
          <span className="text-[11px] font-semibold text-slate-500">
            Current Stage: <span className="text-indigo-600 font-bold">{currentTier > 3 || status === 'Active' ? 'Fully Approved' : status === 'Inactive' ? 'Rejected' : TIER_DEFINITIONS[currentTier - 1]?.name || `Tier ${currentTier}`}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative pt-1">
          {tiers.map((t, idx) => {
            const isLast = idx === tiers.length - 1;
            return (
              <div key={t.tierNum} className="relative flex flex-col justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                {!isLast && (
                  <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                    <ChevronRight size={16} />
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Tier {t.tierNum}: {t.name}
                  </span>
                  <div>
                    {t.state === 'approved' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Check size={12} /> Approved
                      </span>
                    )}
                    {t.state === 'rejected' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <X size={12} /> Rejected
                      </span>
                    )}
                    {t.state === 'pending' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                    {t.state === 'waiting' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Waiting
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-1 text-xs">
                  {t.state === 'approved' && (
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-800 flex items-center gap-1">
                        {t.approverName ? t.approverName : `${t.name} Approved`}
                        {t.isOverride && <Shield size={12} className="text-amber-500" title="Super Admin Override" />}
                      </p>
                      {t.approverRole && <p className="text-[11px] text-slate-500">{t.approverRole}</p>}
                      {t.timestamp && <p className="text-[10px] text-slate-400">{new Date(t.timestamp).toLocaleDateString()} {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                    </div>
                  )}

                  {t.state === 'rejected' && (
                    <div className="space-y-0.5 text-rose-700">
                      <p className="font-semibold">{t.approverName ? `Rejected by ${t.approverName}` : 'Request Rejected'}</p>
                      {t.approverRole && <p className="text-[11px] text-rose-600">{t.approverRole}</p>}
                    </div>
                  )}

                  {t.state === 'pending' && (
                    <div className="text-amber-800">
                      <p className="font-semibold">Awaiting {t.roleName}</p>
                      <p className="text-[11px] text-amber-600">Pending review & approval</p>
                    </div>
                  )}

                  {t.state === 'waiting' && (
                    <p className="text-slate-400 text-[11px] italic">Stage not reached yet</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Default Inline Mode
  return (
    <div className="flex items-center gap-2" title={`Approval Progress: Tier ${currentTier} (${status})`}>
      {tiers.map((t, idx) => (
        <React.Fragment key={t.tierNum}>
          <div className="flex items-center gap-1">
            {t.state === 'approved' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 shadow-xs">
                <Check size={11} className="text-emerald-600" />
                <span>{t.approverName || t.name}</span>
              </span>
            ) : t.state === 'rejected' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 shadow-xs">
                <X size={11} className="text-rose-600" />
                <span>{t.approverName || t.name}</span>
              </span>
            ) : t.state === 'pending' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-300 shadow-xs animate-pulse">
                <Clock size={11} className="text-amber-600" />
                <span>Pending {t.name}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-100/70 px-2 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span>{t.name}</span>
              </span>
            )}
          </div>
          {idx < tiers.length - 1 && <span className="text-slate-300 text-[10px]">→</span>}
        </React.Fragment>
      ))}
    </div>
  );
};
