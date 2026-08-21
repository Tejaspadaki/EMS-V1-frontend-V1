import api from './axios';

export const createEmployee = async (data: {
  name: string;
  email: string;
  department: string;
  role: string;
  reportingManagerId?: string;
  customPassword: string;
}) => {
  const payload = { ...data, managerId: data.reportingManagerId, customPassword: data.customPassword };
  const response = await api.post('/hr/employees', payload);
  return response.data.data; // { user, tempPassword }
};

export const assignTeamLead = async (data: {
  deptHeadId: string;
  teamLeadId: string;
}) => {
  const response = await api.post(`/admin/dept-heads/${data.deptHeadId}/assign-team-lead`, { employeeId: data.teamLeadId });
  return response.data;
};

export const grantHRRole = async (userId: string) => {
  const response = await api.post(`/admin/grant-hr-role/${userId}`);
  return response.data;
};

// Use the newly integrated global search for users
export const searchUsers = async (query: string, _roleFilter?: string) => {
  if (!query.trim()) return [];
  const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
  return response.data?.data?.employees || response.data?.employees || [];
};

export const getDirectoryUsers = async () => {
  const response = await api.get('/search/all-users');
  return Array.isArray(response.data?.data) ? response.data.data : Array.isArray(response.data) ? response.data : [];
};

export const getDashboardData = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return Array.isArray(response.data?.data) ? response.data.data : Array.isArray(response.data) ? response.data : [];
};

export const getDepartmentDashboard = async () => {
  const response = await api.get('/admin/dashboard/department');
  return response.data;
};

export const bulkGenerateRoleCards = async () => {
  const response = await api.post('/admin/employees/bulk-generate');
  return response.data;
};
