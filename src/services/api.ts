
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { toast } from "sonner";

// API configuration
const API_URL = 'http://localhost/keyeff_callpanel/backend';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle unauthorized errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.');
      window.location.href = '/login';
    }
    
    // Show error message
    const errorMessage = error.response?.data?.message || 'Ein Fehler ist aufgetreten';
    toast.error(errorMessage);
    
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login.php', { email, password });
    return response.data;
  },
  
  verify2FA: async (userId: string, otp: string) => {
    const response = await apiClient.post('/api/auth/verify.php', { user_id: userId, otp });
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },
  
  logout: async () => {
    try {
      await apiClient.get('/api/auth/logout.php');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};

// Customer service
export const customerService = {
  getCustomers: async () => {
    const response = await apiClient.get('/api/customers/list.php');
    return response.data.data;
  }
};

// Call service
export const callService = {
  logCall: async (data: {
    customer_id: string;
    log_text: string;
    outcome: string;
    duration?: number;
  }) => {
    const response = await apiClient.post('/api/calls/log.php', data);
    return response.data;
  }
};

// Appointment service
export const appointmentService = {
  createAppointment: async (data: {
    customer_id: string;
    date: string;
    time: string;
    type: string;
    description?: string;
  }) => {
    const response = await apiClient.post('/api/appointments/create.php', data);
    return response.data;
  },
  
  getAppointments: async (startDate?: string, endDate?: string) => {
    let url = '/api/appointments/list.php';
    const params = [];
    
    if (startDate) {
      params.push(`start_date=${startDate}`);
    }
    
    if (endDate) {
      params.push(`end_date=${endDate}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const response = await apiClient.get(url);
    return response.data.data;
  }
};

// Settings service
export const settingsService = {
  getSettings: async (category: string, filialeId?: string) => {
    let url = `/api/settings/get.php?category=${category}`;
    
    if (filialeId) {
      url += `&filiale_id=${filialeId}`;
    }
    
    const response = await apiClient.get(url);
    return response.data.data;
  },
  
  saveSettings: async (category: string, settings: Record<string, string>, filialeId?: string) => {
    const data = {
      category,
      settings,
      filiale_id: filialeId
    };
    
    const response = await apiClient.post('/api/settings/save.php', data);
    return response.data;
  }
};

// Logs service
export const logsService = {
  getLogs: async (filters?: {
    user_id?: string;
    action?: string;
    entity?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }) => {
    let url = '/api/logs/list.php';
    const params = [];
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.push(`${key}=${value}`);
        }
      });
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const response = await apiClient.get(url);
    return response.data.data;
  },
  
  exportLogs: async (filters?: {
    user_id?: string;
    action?: string;
    entity?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    let url = '/api/logs/export.php';
    const params = [];
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.push(`${key}=${value}`);
        }
      });
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const response = await apiClient.get(url);
    return response.data.data;
  }
};

// Statistics service
export const statisticsService = {
  getStatistics: async (startDate?: string, endDate?: string) => {
    let url = '/api/statistics/get.php';
    const params = [];
    
    if (startDate) {
      params.push(`start_date=${startDate}`);
    }
    
    if (endDate) {
      params.push(`end_date=${endDate}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const response = await apiClient.get(url);
    return response.data.data;
  }
};

export default apiClient;
