import api from './axios';

export interface RegularizationRequest {
  id: number;
  user_id: number;
  date: string;
  reason: string;
  requested_punch_in: string | null;
  requested_punch_out: string | null;
  status: 'pending' | 'approved' | 'rejected';
  manager_comment?: string | null;
  manager_id?: number | null;
  created_at: string;
  employee_name?: string;
  employee_email?: string;
  employee_department?: string;
  manager_name?: string;
}

export const getMyRequests = async () => {
  const response = await api.get('/regularization/my-requests');
  return response.data?.data || [];
};

export const submitRequest = async (data: { date: string; reason: string; requested_punch_in?: string | null; requested_punch_out?: string | null }) => {
  const response = await api.post('/regularization/request', data);
  return response.data;
};

// HR / Manager APIs
export const getPendingRequests = async () => {
  const response = await api.get('/regularization/pending');
  return response.data?.data || [];
};

export const getAllRequests = async () => {
  const response = await api.get('/regularization/all');
  return response.data?.data || [];
};

export const processRequest = async (id: number, status: 'approved' | 'rejected', comment?: string) => {
  const response = await api.patch(`/regularization/${id}/process`, { status, comment });
  return response.data;
};
