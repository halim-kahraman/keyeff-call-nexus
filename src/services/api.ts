
import axios from 'axios';

// API-Konfiguration für lokale Entwicklung
const API_BASE_URL = '/backend/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login.php', { email, password });
    return response.data;
  },
  verify2FA: async (userId: string, otp: string) => {
    const response = await api.post('/auth/verify.php', { user_id: userId, otp });
    return response.data;
  },
  requestPasswordReset: async (email: string) => {
    const response = await api.post('/auth/reset-password.php', { email });
    return response.data;
  },
  resetPassword: async (email: string, reset_code: string, new_password: string) => {
    const response = await api.post('/auth/reset-password.php', { 
      email, 
      reset_code, 
      new_password 
    });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout.php');
    return response.data;
  }
};

// Customer service
export const customerService = {
  getCustomers: async (filialeId?: string | null, campaignId?: string | null) => {
    const params = new URLSearchParams();
    if (filialeId) params.append('filiale_id', filialeId);
    if (campaignId) params.append('campaign_id', campaignId);
    
    const response = await api.get(`/customers/list.php?${params.toString()}`);
    return response.data;
  },
  getCustomerDetails: async (customerId: string) => {
    const response = await api.get(`/customers/detail.php?id=${customerId}`);
    return response.data;
  },
  createCustomer: async (customerData: any) => {
    const response = await api.post('/customers/create.php', customerData);
    return response.data;
  },
  importCustomers: async (file: File, campaignId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (campaignId) formData.append('campaign_id', campaignId);
    
    const response = await api.post('/customers/import.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// Campaign service
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

// Settings service
export const settingsService = {
  getSettings: async (filialeId?: string | null) => {
    const params = new URLSearchParams();
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

// Filiale service
export const filialeService = {
  getFilialen: async () => {
    const response = await api.get('/filialen/list.php');
    return response.data;
  }
};

// Statistics service
export const statisticsService = {
  getStatistics: async (filialeId?: string | null, dateRange?: string) => {
    const params = new URLSearchParams();
    if (filialeId) params.append('filiale_id', filialeId);
    if (dateRange) params.append('date_range', dateRange);
    
    const response = await api.get(`/statistics/get.php?${params.toString()}`);
    return response.data;
  }
};

// Connection service
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

// Admin service for managing demo data
export const adminService = {
  resetData: async (operation: string) => {
    const response = await api.post('/admin/reset.php', { operation });
    return response.data;
  }
};

export default api;
