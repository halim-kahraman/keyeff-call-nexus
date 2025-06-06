
import api from './config';

export const customerService = {
  getCustomers: async (filialeId?: string | null, campaignId?: string | null) => {
    const params = new URLSearchParams();
    if (filialeId) params.append('filiale_id', filialeId);
    if (campaignId) params.append('campaign_id', campaignId);
    
    const response = await api.get(`/customers/list.php?${params.toString()}`);
    return response.data;
  },
  
  getCustomerDetail: async (customerId: string) => {
    const response = await api.get(`/customers/detail.php?id=${customerId}`);
    return response.data;
  },
  
  createCustomer: async (customerData: any) => {
    const response = await api.post('/customers/create.php', customerData);
    return response.data;
  },
  
  importCustomers: async (importData: any) => {
    const response = await api.post('/customers/import.php', importData);
    return response.data;
  }
};
