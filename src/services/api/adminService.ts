
import api from './config';

export const adminService = {
  resetData: async (operation: string) => {
    const response = await api.post('/admin/reset.php', { operation });
    return response.data;
  }
};
