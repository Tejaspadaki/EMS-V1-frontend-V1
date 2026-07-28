import api from './axios';

export const sendChatMessage = async (message: string) => {
  const response = await api.post('/ai/chat', { message });
  return response.data.reply;
};
