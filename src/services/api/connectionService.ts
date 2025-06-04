
import api from './config';

export const connectionService = {
  connect: async (filialeId: string) => {
    const response = await api.post('/connections/manage.php', {
      action: 'connect',
      filiale_id: filialeId
    });
    return response.data;
  },
  disconnect: async (filialeId: string) => {
    const response = await api.post('/connections/manage.php', {
      action: 'disconnect',
      filiale_id: filialeId
    });
    return response.data;
  },
  getStatus: async (filialeId: string) => {
    const response = await api.get(`/connections/manage.php?filiale_id=${filialeId}`);
    return response.data;
  }
};
