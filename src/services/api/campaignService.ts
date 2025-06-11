
import api from './config';

export const campaignService = {
  getCampaigns: async () => {
    const response = await api.get('/campaigns/list.php');
    return response.data;
  },
  
  createCampaign: async (campaignData: any) => {
    const response = await api.post('/campaigns/create.php', campaignData);
    return response.data;
  },
  
  updateCampaignStatus: async (id: string, status: string) => {
    const response = await api.put(`/campaigns/${id}/status.php`, { status });
    return response.data;
  }
};
