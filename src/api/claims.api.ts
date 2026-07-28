import api from './axios';

export const getMyClaims = async () => {
  const response = await api.get('/claims/my-claims');
  return response.data.data;
};

export const submitClaim = async (data: any) => {
  const response = await api.post('/claims/submit', data);
  return response.data;
};

// HR routes
export const getPendingClaims = async () => {
  const response = await api.get('/claims/pending');
  return response.data.data;
};

export const processClaim = async (id: number, status: string) => {
  const response = await api.patch(`/claims/${id}/process`, { status });
  return response.data;
};
