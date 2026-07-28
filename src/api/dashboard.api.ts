import api from './axios';

const DEFAULT_OPS_DATA = {
    headcountPlan: { current: 0, nextQuarterTarget: 5, spanOfControlFlags: 0 },
    sops: [],
    risks: [],
    incidents: [],
    tools: [],
    improvements: [],
    projects: []
};

export const getOpsDashboardData = async () => {
    try {
        const res = await api.get('/dashboard/ops');
        return res.data.data;
    } catch (err: any) {
        console.warn('Ops Dashboard API warning (403/Forbidden or network issue):', err.message);
        return DEFAULT_OPS_DATA;
    }
};

export const getGrowthDashboardData = async () => {
    try {
        const res = await api.get('/dashboard/growth');
        return res.data.data;
    } catch (err: any) {
        return { departmentName: 'Unassigned', stageCounts: {}, leads: [], attribution: [], followUpQueue: [] };
    }
};

export const getProductDashboardData = async () => {
    try {
        const res = await api.get('/dashboard/product');
        return res.data.data;
    } catch (err: any) {
        return { roadmap: [], dependencies: [], feedbackLeads: [], productTasks: [] };
    }
};

export const getDesignDashboardData = async () => {
    try {
        const res = await api.get('/dashboard/design');
        return res.data.data;
    } catch (err: any) {
        return { designers: [], designTasks: [] };
    }
};

export const getEngLeadDashboardData = async () => {
    try {
        const res = await api.get('/dashboard/engineering-lead');
        return res.data.data;
    } catch (err: any) {
        return { engineers: [], sprintTasks: [] };
    }
};

export const getAILeadDashboardData = async () => {
    try {
        const res = await api.get('/dashboard/ai-lead');
        return res.data.data;
    } catch (err: any) {
        return { models: [], aiTasks: [] };
    }
};

export const getSecurityDashboardData = async () => {
    try {
        const res = await api.get('/dashboard/security');
        return res.data.data;
    } catch (err: any) {
        return { auditLogs: [], securityAlerts: [] };
    }
};

export const getFinanceDashboardData = async () => {
    try {
        const res = await api.get('/dashboard/finance');
        return res.data.data;
    } catch (err: any) {
        return { revenue: 0, expenses: 0, claims: [] };
    }
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
