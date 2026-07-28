import api from './axios';

export interface Epic {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
}

export const getEpics = async (projectId: string): Promise<Epic[]> => {
  const res = await api.get(`/epics/project/${projectId}`);
  return res.data.data;
};

export const createEpic = async (data: { name: string; description?: string; projectId: string }): Promise<Epic> => {
  const res = await api.post('/epics', data);
  return res.data.data;
};

export const updateEpic = async (id: string, data: Partial<Epic>): Promise<Epic> => {
  const res = await api.put(`/epics/${id}`, data);
  return res.data.data;
};

export const deleteEpic = async (id: string): Promise<void> => {
  await api.delete(`/epics/${id}`);
};
