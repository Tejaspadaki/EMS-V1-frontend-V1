import api from './axios';

export const getCTODashboardData = async () => {
  const response = await api.get('/engineering/dashboard');
  return response.data.data;
};
