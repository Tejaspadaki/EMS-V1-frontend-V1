import api from './axios';
import { useAuthStore } from '../store/authStore';

export const loginWithEmail = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
};

export const verify2FA = async (code: string) => {
  const state = useAuthStore.getState();
  const response = await api.post('/auth/2fa/verify', { userId: state.accessToken, token: code });
  return response.data.data;
};

export const resendOTP = async () => {
  const response = await api.post('/auth/2fa/resend');
  return response.data;
};

export const checkAuthStatus = async () => {
  const token = useAuthStore.getState().accessToken;
  if (!token) return { isAuthenticated: false };
  return { isAuthenticated: true }; // Simplified for mock
};

export const changePassword = async (newPassword: string) => {
  const response = await api.post('/auth/change-password', { newPassword });
  return response.data;
};

export const getGoogleAuthUrl = () => {
  return `${api.defaults.baseURL}/auth/google`;
};

export const getMicrosoftAuthUrl = () => {
  return `${api.defaults.baseURL}/auth/microsoft`;
};

export const getMyProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data.data;
};
