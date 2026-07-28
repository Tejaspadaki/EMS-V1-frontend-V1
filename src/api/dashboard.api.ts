import api from './axios';

export const getOpsDashboardData = async () => {
    const res = await api.get('/dashboard/ops');
    return res.data.data;
};

export const getGrowthDashboardData = async () => {
    const res = await api.get('/dashboard/growth');
    return res.data.data;
};

export const getProductDashboardData = async () => {
    const res = await api.get('/dashboard/product');
    return res.data.data;
};

export const getDesignDashboardData = async () => {
    const res = await api.get('/dashboard/design');
    return res.data.data;
};

export const getEngLeadDashboardData = async () => {
    const res = await api.get('/dashboard/engineering-lead');
    return res.data.data;
};

export const getAILeadDashboardData = async () => {
    const res = await api.get('/dashboard/ai-lead');
    return res.data.data;
};

export const getSecurityDashboardData = async () => {
    const res = await api.get('/dashboard/security');
    return res.data.data;
};

export const getFinanceDashboardData = async () => {
    const res = await api.get('/dashboard/finance');
    return res.data.data;
};

export const createSOP = async (sopData: { title: string; category: string; version?: string; review_date?: string }) => {
    const res = await api.post('/dashboard/ops/sops', sopData);
    return res.data.data;
};

export const logRisk = async (riskData: { title: string; category?: string; severity?: string; mitigation?: string; review_date?: string }) => {
    const res = await api.post('/dashboard/ops/risks', riskData);
    return res.data.data;
};

export const logIncident = async (incidentData: { title: string; severity?: string; post_incident_notes?: string }) => {
    const res = await api.post('/dashboard/ops/incidents', incidentData);
    return res.data.data;
};

export const registerTool = async (toolData: { name: string; purpose?: string; monthly_cost?: number }) => {
    const res = await api.post('/dashboard/ops/tools', toolData);
    return res.data.data;
};

export const submitImprovement = async (improvementData: { title: string; description?: string; impact_tier?: string }) => {
    const res = await api.post('/dashboard/ops/improvements', improvementData);
    return res.data.data;
};

export const logInternHours = async (hoursData: { track_type: string; duration_hours: number; description?: string }) => {
    const res = await api.post('/dashboard/intern/hours', hoursData);
    return res.data;
};

