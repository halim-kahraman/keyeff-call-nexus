
import api from './config';

export const filialeService = {
  getFilialen: async () => {
    const response = await api.get('/filialen/list.php');
    return response.data;
  },
  createFiliale: async (filialeData: any) => {
    const response = await api.post('/filialen/create.php', filialeData);
    return response.data;
  },
  updateFiliale: async (filialeId: string, filialeData: any) => {
    const response = await api.put(`/filialen/update.php?id=${filialeId}`, filialeData);
    return response.data;
  },
  deleteFiliale: async (filialeId: string) => {
    const response = await api.delete(`/filialen/delete.php?id=${filialeId}`);
    return response.data;
  }
};
