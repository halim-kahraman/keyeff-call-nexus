
import api from './config';

export const logsService = {
  getLogs: async () => {
    const response = await api.get('/logs/list.php');
    return response.data;
  }
};
