import api from './axios';

export const getAtsDashboardData = async () => {
  const response = await api.get('/ats/dashboard');
  return response.data.data;
};

export const getCandidates = async () => {
  const response = await api.get('/ats/candidates');
  return response.data.data;
};

export const updateCandidateStage = async (id: number, stage: string) => {
  const response = await api.patch(`/ats/candidates/${id}/stage`, { stage });
  return response.data;
};

export const generateMockCandidate = async () => {
  const response = await api.post('/ats/candidates/mock');
  return response.data;
};
