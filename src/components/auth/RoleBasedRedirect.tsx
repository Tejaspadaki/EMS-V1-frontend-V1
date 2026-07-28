import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore, getRoleDashboardRoute } from '../../store/authStore';

export const RoleBasedRedirect: React.FC = () => {
  const { role } = useAuthStore();

  if (!role) return <Navigate to="/unauthorized" replace />;
  return <Navigate to={getRoleDashboardRoute(role)} replace />;
};
