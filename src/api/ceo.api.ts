import api from './axios';

export const getCEODashboardData = async () => {
  const response = await api.get('/ceo/dashboard');
  return response.data.data;
};

export const exportCEOReportCSV = async () => {
  const response = await api.get('/ceo/export?format=csv', {
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `CEO_Executive_Report_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
