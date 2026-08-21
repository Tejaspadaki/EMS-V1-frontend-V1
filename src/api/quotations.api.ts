import api from './axios';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quotation {
  id: string;
  projectId: string;
  projectTitle: string;
  status: 'Draft' | 'Sent';
  createdAt: string;
  lineItems: LineItem[];
  grandTotal: number;
}

export const getQuotations = async () => {
  const response = await api.get('/quotations');
  return Array.isArray(response.data?.data) ? response.data.data : Array.isArray(response.data) ? response.data : [];
};

export const generateQuotation = async (projectId: string, projectTitle: string, lineItems: Omit<LineItem, 'id' | 'total'>[]) => {
  // projectTitle is sent but not strictly needed by backend, 
  // backend computes it from projectId.
  const response = await api.post('/quotations', { projectId, lineItems });
  return response.data.data;
};
