import api from './axios';

export const getPayrollSummary = async (month?: number, year?: number) => {
  const queryParams = new URLSearchParams();
  if (month) queryParams.append('month', month.toString());
  if (year) queryParams.append('year', year.toString());
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const response = await api.get(`/payroll/summary${query}`);
  return response.data.data;
};

export const processPayroll = async (month: number, year: number) => {
  const response = await api.post('/payroll/process', { month, year });
  return response.data;
};

export const getMyPayslips = async () => {
  const response = await api.get('/payroll/me');
  return response.data.data;
};
