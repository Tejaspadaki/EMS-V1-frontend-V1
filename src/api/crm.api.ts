import api from './axios';

export const getCustomerDashboardData = async () => {
  const response = await api.get('/crm/dashboard');
  return response.data.data;
};
