import api from './axios';

export const performanceApi = {
  getMyReviews: async () => {
    const response = await api.get('/performance/my-reviews');
    return response.data;
  },
  submitReview: async (data: { user_id: number; review_period: string; rating: number; kpi_score: number; feedback: string }) => {
    const response = await api.post('/performance/review', data);
    return response.data;
  }
};
