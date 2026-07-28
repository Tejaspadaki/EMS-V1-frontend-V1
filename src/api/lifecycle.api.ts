import api from './axios';

// Performance API
export const getMyReviews = async () => {
  const response = await api.get('/performance/my-reviews');
  return response.data.data;
};

// Training API
export const getTrainingPrograms = async () => {
  const response = await api.get('/training');
  return response.data.data;
};

export const getMyTrainings = async () => {
  const response = await api.get('/training/my-trainings');
  return response.data.data;
};

export const enrollInTraining = async (program_id: number) => {
  const response = await api.post('/training/enroll', { program_id });
  return response.data;
};

// Exit API
export const getExitRequests = async () => {
  const response = await api.get('/exit');
  return response.data.data;
};

export const submitResignation = async (data: any) => {
  const response = await api.post('/exit/resign', data);
  return response.data;
};

export const processExitRequest = async (id: number, data: any) => {
  const response = await api.patch(`/exit/${id}/process`, data);
  return response.data;
};
