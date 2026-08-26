import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicProfile, type EmployeeDetails } from '../../api/employees.api';
import { ShieldAlert, Fingerprint } from 'lucide-react';

export const PublicProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<EmployeeDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getPublicProfile(id).then(data => {
      setProfile(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  // Strict Privacy Gateway
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert size={36} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Available</h1>
        <p className="text-gray-500 max-w-sm mx-auto">
          This digital role card has either not been generated or has been invalidated by the organization.
        </p>
      </div>
    );
  }

  // Public View
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-[var(--color-border)] rounded-2xl p-8 shadow-xl relative overflow-hidden text-center">
        {/* Brand Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[var(--color-primary)]"></div>
        
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg mb-6 rotate-3">
          <Fingerprint size={40} className="opacity-90" />
        </div>
        
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">{profile.name}</h1>
        <p className="text-[var(--color-text-secondary)] text-sm mb-4">ID: {profile.id.toUpperCase()}</p>
        
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {(profile.roles && profile.roles.length > 0 ? profile.roles : [profile.role]).map((r, idx) => (
            <div key={idx} className="inline-block px-4 py-1.5 bg-indigo-50 border border-[var(--color-primary)]/20 text-[var(--color-primary)] font-bold rounded-full uppercase tracking-widest text-sm">
              {r}
            </div>
          ))}
        </div>
        
        <div className="w-full bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center justify-center gap-2">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Department:</span>
          <span className="text-sm font-bold text-gray-800">{profile.department}</span>
        </div>
        
        <div className="mt-8 pt-4 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-mono tracking-widest uppercase">
            <ShieldAlert size={12} /> Confirmed Valid via EMS
          </div>
        </div>
      </div>
    </div>
  );
};
