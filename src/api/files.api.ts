import api from './axios';

export interface FileMetadata {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  created_at: string;
}

export const getFilesList = async (type: 'image' | 'document' | 'recording'): Promise<FileMetadata[]> => {
  const response = await api.get(`/upload/list/${type}`);
  return response.data.data;
};

export const uploadFile = async (type: 'image' | 'document' | 'recording', file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post(`/upload/${type}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

export const fetchFileBlobUrl = async (type: 'image' | 'document' | 'recording', id: string): Promise<string> => {
  const response = await api.get(`/upload/${type}/${id}`, { responseType: 'blob' });
  const blob = response.data instanceof Blob 
    ? response.data 
    : new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });
  return URL.createObjectURL(blob);
};

