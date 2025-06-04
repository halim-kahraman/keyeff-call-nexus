
import api from './config';

export const settingsService = {
  getSettings: async (category: string, filialeId?: string | null) => {
    const params = new URLSearchParams();
    params.append('category', category);
    if (filialeId) params.append('filiale_id', filialeId);
    
    const response = await api.get(`/settings/get.php?${params.toString()}`);
    return response.data;
  },
  saveSettings: async (settings: any, filialeId?: string | null) => {
    const response = await api.post('/settings/save.php', {
      ...settings,
      filiale_id: filialeId
    });
    return response.data;
  },
  testSipConnection: async (settings: any) => {
    const response = await api.post('/settings/test-sip.php', settings);
    return response.data;
  },
  testVpnConnection: async (settings: any) => {
    const response = await api.post('/settings/test-vpn.php', settings);
    return response.data;
  },
  testFritzboxConnection: async (settings: any) => {
    const response = await api.post('/settings/test-fritzbox.php', settings);
    return response.data;
  },
  testEmailConnection: async (settings: any) => {
    const response = await api.post('/settings/test-email.php', settings);
    return response.data;
  },
  testKeyEffApiConnection: async (settings: any) => {
    const response = await api.post('/settings/test-keyeff-api.php', settings);
    return response.data;
  }
};
