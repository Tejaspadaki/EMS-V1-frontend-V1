import api from './axios';

export interface EmployeeOnboardData {
  name: string;
  email: string;
  department: string;
  role: string;
  reportingManagerId?: string;
  startDate: string;
  customPassword: string;
}

export const onboardEmployee = async (data: EmployeeOnboardData) => {
  const payload = { ...data, managerId: data.reportingManagerId, customPassword: data.customPassword };
  const response = await api.post('/hr/employees', payload);
  return response.data.data; // Expected: { empId, qrCodeUrl, tempPassword }
};

export const getPendingOnboardings = async () => {
  const response = await api.get('/hr/employees/pending');
  return response.data;
};

export const updateChecklistItem = async (empId: string, itemKey: string, completed: boolean) => {
  const response = await api.patch(`/hr/employees/${empId}/checklist/${itemKey}`, { value: completed });
  return response.data;
};

export const getPendingRemindersCount = async () => {
  const response = await api.get('/hr/employees/reminders/count');
  return response.data.count;
};

export const sendOnboardingEmail = async (empId: string, message: string) => {
  const response = await api.post(`/hr/employees/${empId}/send-email`, { message });
  return response.data;
};

export const submitEmployeeDocuments = async () => {
  const response = await api.post('/auth/me/onboarding/documents');
  return response.data;
};

export const getMyOnboardingChecklist = async () => {
  const response = await api.get('/auth/me/onboarding/checklist');
  return response.data;
};

// Document APIs
export const uploadEmployeeDocument = async (userId: string, documentType: string, file: File) => {
  const formData = new FormData();
  formData.append('userId', userId);
  formData.append('documentType', documentType);
  formData.append('document', file);

  const response = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getEmployeeDocuments = async (userId: string) => {
  const response = await api.get(`/documents/${userId}`);
  return response.data.data;
};

// HR Analytics API
export const getHRDemographics = async () => {
  const response = await api.get('/hr-analytics/demographics');
  return response.data.data;
};
