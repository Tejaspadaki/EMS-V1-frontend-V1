import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UnauthorizedPlaceholder: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center max-w-md mx-auto">
      <ShieldAlert size={64} className="text-red-500 mb-6" />
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Access Denied</h1>
      <p className="text-[var(--color-text-secondary)] mb-8">
        You do not have the required permissions to view this page. If you believe this is an error, please contact your administrator.
      </p>
      <Link to="/dashboard" className="novynth-btn px-6 py-2">
        Return to Dashboard
      </Link>
    </div>
  );
};
