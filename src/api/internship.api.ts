import api from './axios';

export const getMyProgram = async () => {
  const response = await api.get('/internships/my-program');
  return response.data.data;
};

// HR / Mentor routes
export const getPrograms = async () => {
  const response = await api.get('/internships/programs');
  return response.data.data;
};

export const createProgram = async (data: { intern_id: number, mentor_id: number, start_date: string, end_date: string }) => {
  const response = await api.post('/internships/programs', data);
  return response.data;
};

export const addMilestone = async (programId: number, data: { title: string, due_date: string }) => {
  const response = await api.post(`/internships/programs/${programId}/milestones`, data);
  return response.data;
};

export const updateMilestoneStatus = async (milestoneId: number, status: string) => {
  const response = await api.patch(`/internships/milestones/${milestoneId}/status`, { status });
  return response.data;
};

// PR Routes
export const submitPR = async (projectId: string, data: { title: string, pr_url: string }) => {
  const response = await api.post(`/internships/projects/${projectId}/prs`, data);
  return response.data;
};

export const getPRs = async (projectId: string) => {
  const response = await api.get(`/internships/projects/${projectId}/prs`);
  return response.data.data;
};

export const reviewPR = async (prId: number, data: { status: string, feedback?: string }) => {
  const response = await api.patch(`/internships/prs/${prId}/review`, data);
  return response.data;
};
