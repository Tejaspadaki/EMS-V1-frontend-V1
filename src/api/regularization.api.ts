import api from './axios';

export const getMyRequests = async () => {
  const response = await api.get('/regularization/my-requests');
  return response.data.data;
};

export const submitRequest = async (data: any) => {
  const response = await api.post('/regularization/request', data);
  return response.data;
};

// HR/Manager routes
export const getPendingRequests = async () => {
  const response = await api.get('/regularization/pending');
  return response.data.data;
};

export const processRequest = async (id: number, status: string, comment?: string) => {
  const response = await api.patch(`/regularization/${id}/process`, { status, comment });
  return response.data;
};
