
import api from './config';

export const settingsService = {
  getSettings: async (branchId?: string) => {
    const params = branchId ? `?branch_id=${branchId}` : '';
    const response = await api.get(`/settings/get.php${params}`);
    return response.data;
  },
  
  saveSettings: async (branchId: string, data: any) => {
    const response = await api.post('/settings/save.php', { branch_id: branchId, ...data });
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
