
import api from './config';

export const campaignService = {
  getCampaigns: async () => {
    const response = await api.get('/campaigns/list.php');
    return response.data;
  }
};
