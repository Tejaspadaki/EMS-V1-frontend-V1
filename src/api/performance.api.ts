import api from './axios';

export interface PerformanceReview {
  id: number;
  user_id: number;
  reviewer_id: number;
  review_period: string;
  rating: number;
  kpi_score: number | null;
  feedback: string;
  created_at: string;
  employee_name?: string;
  employee_email?: string;
  employee_department?: string;
  reviewer_name?: string;
}

export interface PerformanceAnalytics {
  total_reviews: number;
  avg_rating: number;
  avg_kpi_score: number;
  top_performers_count: number;
  recent_reviews: PerformanceReview[];
}

export const performanceApi = {
  getMyReviews: async () => {
    const response = await api.get('/performance/my-reviews');
    return response.data?.data || response.data || [];
  },

  getAllReviews: async () => {
    const response = await api.get('/performance/all');
    return response.data?.data || response.data || [];
  },

  getAnalytics: async (): Promise<PerformanceAnalytics> => {
    const response = await api.get('/performance/analytics');
    return response.data?.data || response.data;
  },

  submitReview: async (data: { user_id: number; review_period: string; rating: number; kpi_score?: number; feedback?: string }) => {
    const response = await api.post('/performance/review', data);
    return response.data;
  }
};
