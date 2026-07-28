import api from './axios';

export interface Department {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export const getAllDepartments = async (): Promise<Department[]> => {
  const response = await api.get('/departments');
  return response.data.data;
};

export const createDepartment = async (data: { name: string; description?: string }): Promise<Department> => {
  const response = await api.post('/departments', data);
  return response.data.data;
};

export const updateDepartment = async (id: string, data: { name: string; description?: string }): Promise<Department> => {
  const response = await api.put(`/departments/${id}`, data);
  return response.data.data;
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await api.delete(`/departments/${id}`);
};

export const getDeptHeadDashboard = async () => {
  const response = await api.get('/departments/dashboard');
  return response.data.data;
};
