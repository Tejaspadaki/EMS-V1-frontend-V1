import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { IncomingCallOverlay } from './IncomingCallOverlay';
import { useSocket } from '../../hooks/useSocket';
import { useAuthStore } from '../../store/authStore';
import { ToastContainer as OldToastContainer } from '../ui/ToastContainer';
import { ToastContainer as NewToastContainer } from '../ui/ToastNotification';

export const AppLayout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useSocket(); // Initialize real-time WebSocket connection

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen w-full bg-[var(--color-canvas)]">
      <OldToastContainer />
      <NewToastContainer />
      <IncomingCallOverlay />
      <Sidebar collapsed={sidebarCollapsed} />
      <Topbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} sidebarCollapsed={sidebarCollapsed} />
      
      <main className={`ems-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

