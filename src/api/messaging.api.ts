import api from './axios';
import { useAuthStore } from '../store/authStore';

export interface Channel {
  id: string;
  name: string;
  type: 'Public' | 'Private' | 'Announcement' | 'Direct' | 'Project';
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  lastMessageSenderId?: string;
  lastMessageType?: 'text' | 'image' | 'video' | 'file' | 'audio';
  avatarUrl?: string;
  isOnline?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isSelf: boolean;
  isPinned?: boolean;
  attachment?: {
    url: string;
    type: 'image' | 'file';
    name: string;
    size: string;
  };
  reactions?: Record<string, string[]>;
}

export const getChannels = async () => {
  const response = await api.get('/channels');
  return response.data.data;
};

export const getChannelMessages = async (channelId: string) => {
  const response = await api.get(`/channels/${channelId}/messages`);
  const currentUserId = useAuthStore.getState().user?.id;
  
  return response.data.data.map((m: any) => ({
    ...m,
    isSelf: m.senderId?.toString() === currentUserId?.toString()
  }));
};

export const createMessage = async (channelId: string, content: string, attachment?: any) => {
  const response = await api.post(`/channels/${channelId}/messages`, { content, attachment });
  return response.data.data;
};

export const toggleReaction = async (channelId: string, messageId: string, emoji: string) => {
  const response = await api.post(`/channels/${channelId}/messages/${messageId}/react`, { emoji });
  return response.data.data;
};

// --- Enterprise Messaging Upgrades ---

export const createGroup = async (name: string, description: string, memberIds: (string | number)[] = []) => {
  const response = await api.post('/api/group', { name, description, memberIds });
  return response.data.data;
};

export const joinGroup = async (inviteCode: string) => {
  const response = await api.post('/api/group/join', { inviteCode });
  return response.data.data;
};

export const getGroupMembers = async (groupId: string) => {
  const response = await api.get(`/api/group/${groupId}/members`);
  return response.data.data;
};

export const addMember = async (groupId: string, userId: string) => {
  const response = await api.post(`/api/group/${groupId}/members`, { userId });
  return response.data.data;
};

export const removeMember = async (groupId: string, userId: string) => {
  const response = await api.delete(`/api/group/${groupId}/members/${userId}`);
  return response.data.data;
};

export const leaveGroup = async (groupId: string) => {
  const response = await api.post(`/api/group/${groupId}/leave`);
  return response.data.data;
};

export const generateInviteLink = async (groupId: string) => {
  const response = await api.post(`/api/group/${groupId}/invite-link`);
  return response.data.data;
};

export const pinMessage = async (messageId: string) => {
  const response = await api.post(`/api/group/messages/${messageId}/pin`);
  return response.data.data;
};

export const deleteMessageForEveryone = async (messageId: string) => {
  const response = await api.delete(`/api/group/messages/${messageId}`);
  return response.data.data;
};

export const deleteMessageForMe = async (messageId: string) => {
  const response = await api.delete(`/api/group/messages/${messageId}/me`);
  return response.data.data;
};

export const searchChat = async (query: string) => {
  const response = await api.get(`/api/chat/search?query=${encodeURIComponent(query)}`);
  return response.data.data;
};

export const getReport = async (reportType: string) => {
  const response = await api.get(`/api/chat/report/${reportType}`);
  return response.data.data;
};

export const getAllUsersList = async () => {
  const response = await api.get('/admin/users');
  return response.data.data;
};
