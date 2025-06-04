
import api from './config';

export const logsService = {
  getLogs: async (params?: any) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page);
    if (params?.limit) searchParams.append('limit', params.limit);
    if (params?.user_id) searchParams.append('user_id', params.user_id);
    if (params?.action) searchParams.append('action', params.action);
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    
    const response = await api.get(`/logs/list.php?${searchParams.toString()}`);
    return response.data;
  }
};
