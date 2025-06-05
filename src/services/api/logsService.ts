
import api from './config';

export const logsService = {
  getLogs: async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to query parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    const response = await api.get(`/logs/list.php?${params.toString()}`);
    return response.data;
  },

  exportLogs: async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to query parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    const response = await api.get(`/logs/export.php?${params.toString()}`, {
      responseType: 'blob'
    });
    
    return response.data;
  }
};
