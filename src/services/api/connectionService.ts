
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
  },
  getConnections: async () => {
    const response = await api.get('/connections/manage.php');
    return response.data;
  },
  startConnection: async (filialeId: string, connectionType: string, connectionData: any = {}) => {
    const response = await api.post('/connections/manage.php', {
      action: 'start',
      filiale_id: filialeId,
      connection_type: connectionType,
      connection_data: connectionData
    });
    return response.data;
  },
  updateConnection: async (sessionId: string, status: string, connectionData: any = {}) => {
    const response = await api.put('/connections/manage.php', {
      session_id: sessionId,
      status: status,
      connection_data: connectionData
    });
    return response.data;
  },
  endConnection: async (sessionId: string) => {
    const response = await api.delete(`/connections/manage.php?session_id=${sessionId}`);
    return response.data;
  }
};
