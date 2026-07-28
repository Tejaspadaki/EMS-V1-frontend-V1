import api from './axios';

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string;
  status: 'planning' | 'active' | 'completed';
  startDate?: string;
  endDate?: string;
  totalStoryPoints: number;
  totalTasksCount: number;
}

export interface BurndownPoint {
  date: string;
  ideal: number;
  actual: number | null;
}

export interface BurndownResponse {
  sprintName: string;
  totalStoryPoints: number;
  burndown: BurndownPoint[];
}

export const getSprints = async (projectId: string): Promise<Sprint[]> => {
  const res = await api.get(`/sprints/project/${projectId}`);
  return res.data.data;
};

export const createSprint = async (data: { name: string; goal?: string; projectId: string }): Promise<Sprint> => {
  const res = await api.post('/sprints', data);
  return res.data.data;
};

export const updateSprint = async (id: string, data: Partial<Sprint>): Promise<Sprint> => {
  const res = await api.put(`/sprints/${id}`, data);
  return res.data.data;
};

export const deleteSprint = async (id: string): Promise<void> => {
  await api.delete(`/sprints/${id}`);
};

export const startSprint = async (id: string): Promise<Sprint> => {
  const res = await api.post(`/sprints/${id}/start`);
  return res.data.data;
};

export const completeSprint = async (id: string, rolloverSprintId?: string | null): Promise<any> => {
  const res = await api.post(`/sprints/${id}/complete`, { rolloverSprintId });
  return res.data.data;
};

export const getSprintBurndown = async (id: string): Promise<BurndownResponse> => {
  const res = await api.get(`/sprints/${id}/burndown`);
  return res.data.data;
};
