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

export const getMyRequests = async () => {
  const response = await api.get('/requests/my');
  return response.data.data.map((r: any) => ({
    ...r,
    status: r.status?.toUpperCase() === 'APPROVED' ? 'Active' : (r.status?.toUpperCase() === 'REJECTED' ? 'Inactive' : 'Pending'),
    startDate: new Date(r.startDate).toISOString().split('T')[0],
    endDate: r.endDate ? new Date(r.endDate).toISOString().split('T')[0] : undefined
  }));
};

export const getApprovalQueue = async (_role: string) => {
  const response = await api.get('/requests/queue');
  return response.data.data.map((r: any) => ({
    ...r,
    status: r.status?.toUpperCase() === 'APPROVED' ? 'Active' : (r.status?.toUpperCase() === 'REJECTED' ? 'Inactive' : 'Pending'),
    startDate: new Date(r.startDate).toISOString().split('T')[0],
    endDate: r.endDate ? new Date(r.endDate).toISOString().split('T')[0] : undefined
  }));
};

export const processRequest = async (id: string, action: 'approve' | 'reject') => {
  const response = await api.post(`/requests/${id}/${action}`);
  return response.data;
};

export const getAllRequestsAdmin = async () => {
  const response = await api.get('/requests/all');
  return response.data.data.map((r: any) => ({
    ...r,
    status: r.status?.toUpperCase() === 'APPROVED' ? 'Active' : (r.status?.toUpperCase() === 'REJECTED' ? 'Inactive' : 'Pending'),
    startDate: new Date(r.startDate).toISOString().split('T')[0],
    endDate: r.endDate ? new Date(r.endDate).toISOString().split('T')[0] : undefined
  }));
};

export const overrideRequestAdmin = async (id: string, action: string, targetTier?: number) => {
  const response = await api.post(`/requests/${id}/override`, { action, newTier: targetTier });
  return response.data;
};

export const deleteLeaveRequest = async (id: string) => {
  const response = await api.delete(`/requests/${id}`);
  return response.data;
};
