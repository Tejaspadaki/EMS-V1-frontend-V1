import api from './axios';

export const getMyProfile = async () => {
  const response = await api.get('/profile');
  return response.data.data;
};

export const updateMyProfile = async (data: any) => {
  const response = await api.put('/profile', data);
  return response.data;
};
