import api from './axios';
import axios from 'axios';

export interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
}

export interface AttendanceLogEntry {
  id: string;
  date: string;
  type: string;
  status?: 'on_time' | 'late' | 'half_day' | 'early_departure';
  recordedAt: string;
}

export interface EmployeeDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  role: string;
  roleCardGenerated: boolean;
  roleCardQrCodeUrl?: string;
  contributionScore: number;
  attendances?: AttendanceLogEntry[];
  auditLog: AuditLogEntry[];
}

export const getEmployeeDetails = async (id: string) => {
  const res = await api.get(`/role-cards/${id}`);
  return res.data.data;
};

export const generateRoleCard = async (id: string) => {
  await api.post(`/admin/role-cards/${id}/generate-role-card`);
};

export const regenerateRoleCard = async (id: string) => {
  await api.post(`/admin/role-cards/${id}/generate-role-card?regenerate=true`);
};

export const exportRoleCardPDF = async (id: string) => {
  const response = await api.get(`/role-cards/${id}/pdf`, {
    responseType: 'blob'
  });
  
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  return { url };
};

export const getPublicProfile = async (id: string) => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await axios.get(`${baseUrl}/public/qr/${id}`);
    return res.data.data;
  } catch (err: any) {
    if (err.response?.status === 403) return null;
    throw err;
  }
};
