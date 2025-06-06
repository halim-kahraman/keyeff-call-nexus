
import api from './config';

export const connectionService = {
  connect: async (filialeId: string) => {
    const response = await api.post('/backend/api/connections/manage.php', {
      action: 'connect',
      filiale_id: filialeId
    });
    return response.data;
  },
  disconnect: async (filialeId: string) => {
    const response = await api.post('/backend/api/connections/manage.php', {
      action: 'disconnect',
      filiale_id: filialeId
    });
    return response.data;
  },
  getStatus: async (filialeId: string) => {
    const response = await api.get(`/backend/api/connections/manage.php?filiale_id=${filialeId}`);
    return response.data;
  },
  getConnections: async () => {
    const response = await api.get('/backend/api/connections/manage.php');
    return response.data;
  },
  startConnection: async (filialeId: string, connectionType: string, connectionData: any = {}) => {
    const response = await api.post('/backend/api/connections/manage.php', {
      filiale_id: filialeId,
      connection_type: connectionType,
      connection_data: connectionData
    });
    return response.data;
  },
  updateConnection: async (sessionId: string, status: string, connectionData: any = {}) => {
    const response = await api.put('/backend/api/connections/manage.php', {
      session_id: sessionId,
      status: status,
      connection_data: connectionData
    });
    return response.data;
  },
  endConnection: async (sessionId: string) => {
    const response = await api.delete(`/backend/api/connections/manage.php?session_id=${sessionId}`);
    return response.data;
  }
};
