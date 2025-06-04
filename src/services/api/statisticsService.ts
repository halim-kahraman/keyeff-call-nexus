
import api from './config';

export const statisticsService = {
  getStatistics: async (filialeId?: string | null, dateRange?: string) => {
    const params = new URLSearchParams();
    if (filialeId) params.append('filiale_id', filialeId);
    if (dateRange) params.append('date_range', dateRange);
    
    const response = await api.get(`/statistics/get.php?${params.toString()}`);
    return response.data;
  }
};
