
import api from './config';

export const campaignService = {
  getCampaigns: async (filialeId?: string | null) => {
    const params = new URLSearchParams();
    if (filialeId) params.append('filiale_id', filialeId);
    
    const response = await api.get(`/campaigns/list.php?${params.toString()}`);
    return response.data;
  },
  startSession: async (campaignId: string) => {
    const response = await api.post('/campaigns/session.php', {
      action: 'start',
      campaign_id: campaignId
    });
    return response.data;
  },
  endSession: async (campaignId: string) => {
    const response = await api.post('/campaigns/session.php', {
      action: 'end',
      campaign_id: campaignId
    });
    return response.data;
  },
  checkSession: async (campaignId: string) => {
    const response = await api.get(`/campaigns/session.php?campaign_id=${campaignId}`);
    return response.data;
  }
};
