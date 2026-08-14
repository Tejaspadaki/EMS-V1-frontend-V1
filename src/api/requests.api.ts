import api from './axios';

export type RequestType = 'Leave' | 'WFH';
export type RequestStatus = 'Pending' | 'Active' | 'Inactive'; // Inactive = Rejected, Active = Approved

export interface RequestAudit {
  id: string;
  actorName: string;
  actorRole: string;
  action: 'Approved' | 'Rejected' | 'Overridden' | 'Reassigned';
  timestamp: string;
  isOverride?: boolean;
}

export interface LeaveRequestData {
  id: string;
  type: RequestType;
  employeeName: string;
  userEmail?: string;
  startDate: string;
  endDate?: string;
  deliverables?: string;
  isHalfDay?: boolean;
  reason?: string;
  status: RequestStatus;
  currentTier: number; // 1 = Team Lead, 2 = Dept Head, 3 = HR, 4 = Fully Approved
  auditTrail: RequestAudit[];
  createdAt?: string;
}

export const createLeaveRequest = async (data: any) => {
  const response = await api.post('/requests/leave', data);
  return response.data;
};

export const createWfhRequest = async (data: any) => {
  const response = await api.post('/requests/wfh', data);
  return response.data;
};

const normalizeRequestItem = (r: any): LeaveRequestData => {
  const rawStart = r.startDate || r.start_date || r.created_at || r.createdAt;
  const rawEnd = r.endDate || r.end_date;
  
  let startDate = 'N/A';
  if (rawStart) {
    const d = new Date(rawStart);
    if (!isNaN(d.getTime())) {
      startDate = d.toISOString().split('T')[0];
    }
  }

  let endDate: string | undefined = undefined;
  if (rawEnd) {
    const d = new Date(rawEnd);
    if (!isNaN(d.getTime())) {
      endDate = d.toISOString().split('T')[0];
    }
  }

  const rawType = (r.type || 'Leave').toString();
  const type: RequestType = rawType.toLowerCase().includes('wfh') ? 'WFH' : 'Leave';

  const statusRaw = (r.status || 'pending').toString().toLowerCase();
  const status: RequestStatus = statusRaw === 'approved' || statusRaw === 'active' 
    ? 'Active' 
    : statusRaw === 'rejected' || statusRaw === 'inactive' 
      ? 'Inactive' 
      : 'Pending';

  return {
    id: (r.id ?? '').toString(),
    type,
    employeeName: r.employeeName || r.employee_name || r.userName || r.user_name || 'Employee',
    startDate,
    endDate,
    deliverables: r.deliverables || r.reason || '',
    isHalfDay: Boolean(r.is_half_day || r.isHalfDay),
    reason: r.reason || '',
    status,
    currentTier: Number(r.currentTier ?? r.current_tier ?? 1),
    auditTrail: Array.isArray(r.auditTrail || r.audit_trail) ? (r.auditTrail || r.audit_trail) : [],
    createdAt: r.created_at || r.createdAt
  };
};

export const getMyRequests = async (): Promise<LeaveRequestData[]> => {
  const response = await api.get('/requests/my');
  const items = Array.isArray(response.data?.data) ? response.data.data : Array.isArray(response.data) ? response.data : [];
  return items.map(normalizeRequestItem);
};

export const getApprovalQueue = async (_role: string): Promise<LeaveRequestData[]> => {
  const response = await api.get('/requests/queue');
  const items = Array.isArray(response.data?.data) ? response.data.data : Array.isArray(response.data) ? response.data : [];
  return items.map(normalizeRequestItem);
};

export const processRequest = async (id: string, action: 'approve' | 'reject') => {
  const response = await api.post(`/requests/${id}/${action}`);
  return response.data;
};

export const getAllRequestsAdmin = async (): Promise<LeaveRequestData[]> => {
  const response = await api.get('/requests/all');
  const items = Array.isArray(response.data?.data) ? response.data.data : Array.isArray(response.data) ? response.data : [];
  return items.map(normalizeRequestItem);
};

export const overrideRequestAdmin = async (id: string, action: string, targetTier?: number) => {
  const response = await api.post(`/requests/${id}/override`, { action, newTier: targetTier });
  return response.data;
};

export const deleteLeaveRequest = async (id: string) => {
  const response = await api.delete(`/requests/${id}`);
  return response.data;
};
