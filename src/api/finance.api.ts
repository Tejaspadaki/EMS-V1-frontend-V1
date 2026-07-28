import api from './axios';

export const getCEODashboardData = async () => {
  const response = await api.get('/finance/dashboard');
  return response.data;
};
