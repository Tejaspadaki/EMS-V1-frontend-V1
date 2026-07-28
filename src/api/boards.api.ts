import api from './axios';

export interface BoardColumn {
  id: string;
  projectId: string;
  name: string;
  position: number;
  wipLimit: number | null;
}

export const getBoardColumns = async (projectId: string): Promise<BoardColumn[]> => {
  const res = await api.get(`/boards/project/${projectId}`);
  return res.data.data;
};

export const createBoardColumn = async (data: { name: string; wipLimit?: number | null; projectId: string }): Promise<BoardColumn> => {
  const res = await api.post('/boards', data);
  return res.data.data;
};

export const updateBoardColumn = async (id: string, data: { name: string; position: number; wipLimit?: number | null }): Promise<BoardColumn> => {
  const res = await api.put(`/boards/${id}`, data);
  return res.data.data;
};

export const deleteBoardColumn = async (id: string, projectId: string): Promise<any> => {
  const res = await api.delete(`/boards/${id}?projectId=${projectId}`);
  return res.data.data;
};
