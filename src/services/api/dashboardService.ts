
import api from './config';

export const dashboardService = {
  getDashboardStats: async () => {
    const response = await api.get('/statistics/dashboard.php');
    return response.data;
  }
};
