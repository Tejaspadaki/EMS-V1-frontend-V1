import api from './axios';

export interface StandupRecord {
  id: string;
  date: string;
  status: 'Attended' | 'Missed' | 'Excused' | 'PENDING' | 'PRESENT';
  notes?: string;
}

export const submitCheckIn = async (data: { currentDescriptor: number[]; lat: number; lng: number }) => {
  const response = await api.post('/attendance/checkin', { 
    currentDescriptor: data.currentDescriptor,
    latitude: data.lat,
    longitude: data.lng
  });
  return response.data;
};

export const enrollFace = async (data: { 
  descriptors: { front: number[]; left?: number[]; right?: number[] }; 
  images: { front: string; left?: string; right?: string };
  employeeId: string;
}) => {
  const response = await api.post('/attendance/enroll-face', { 
    descriptors: data.descriptors,
    images: data.images,
    employeeId: data.employeeId
  });
  return response.data;
};

export const getStandups = async () => {
  const response = await api.get('/standups/me');
  // Map backend 'PRESENT' to 'Attended' for UI
  return response.data.data.map((r: any) => ({
    ...r,
    status: r.status === 'PRESENT' ? 'Attended' : r.status
  }));
};

export const excuseStandup = async (date: string, reason: string) => {
  const response = await api.post('/standups/excuse', { date, reason });
  return response.data;
};

export const submitCheckOut = async (lat: number, lng: number) => {
  const response = await api.post('/attendance/checkout', {
    latitude: lat,
    longitude: lng
  });
  return response.data;
};

export const getPendingFaces = async () => {
  const response = await api.get('/attendance/face/pending');
  return response.data;
};

export const approveFace = async (id: number) => {
  const response = await api.put(`/attendance/face/approve/${id}`);
  return response.data;
};

export const rejectFace = async (id: number, reason: string) => {
  const response = await api.put(`/attendance/face/reject/${id}`, { reason });
  return response.data;
};

export interface AuditLogEntry {
  id: number;
  user_id: number;
  name: string;
  emp_id: string;
  date: string;
  type: string;
  status: string;
  ip_address: string | null;
  device_info: string | null;
  recorded_at: string;
}

export const getAuditLogs = async (): Promise<{ success: boolean, data: AuditLogEntry[] }> => {
  const response = await api.get('/attendance/audit');
  return response.data;
};

export const getAttendanceAdminDashboard = async () => {
  const response = await api.get('/attendance/admin/dashboard');
  return response.data;
};

export const exportAuditLogsPDF = async () => {
  const response = await api.get('/attendance/audit/export/pdf', {
    responseType: 'blob'
  });
  return response.data;
};
