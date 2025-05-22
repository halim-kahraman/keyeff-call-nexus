import axios, { AxiosError } from 'axios';
import { toast } from "sonner";

// Get current URL components for better environment detection
const currentHost = window.location.hostname;
const currentPort = window.location.port;

// API configuration - optimized for local development
const API_URL = (() => {
  console.log('Environment detection:', {
    hostname: currentHost,
    port: currentPort
  });
  
  // For local development on any port (both on localhost)
  if (currentHost === 'localhost') {
    return '/keyeff_callpanel/backend'; // Use relative path since both frontend and backend are on localhost
  }
  
  // For any other environment (production or different hosts)
  return 'http://' + currentHost + '/keyeff_callpanel/backend';
})();

console.log('API URL configured as:', API_URL);

// Create axios instance with updated configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Must be false for cross-origin requests with "*" for Access-Control-Allow-Origin
});

// Add request interceptor to add token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Log the request for debugging
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    console.log('Request headers:', config.headers);
    console.log('Request data:', config.data);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`Response from ${response.config.url}:`, response.status);
    console.log('Response data:', response.data);
    return response;
  },
  (error: AxiosError) => {
    console.error('API Error:', error);
    
    // Special handling for CORS errors
    if (error.message && error.message.includes('Network Error')) {
      console.error('Network error detected', {
        url: error.config?.url,
        headers: error.config?.headers,
        baseURL: error.config?.baseURL
      });
      
      toast.error('Netzwerkfehler', {
        description: 'Es gibt ein Problem mit der Verbindung zum Server.',
        duration: 6000
      });
    }
    // Handle unauthorized errors
    else if (error.response?.status === 401) {
      console.warn('Unauthorized access attempt (401)', {
        url: error.config?.url,
        data: error.response?.data
      });
      
      // Only redirect to login if not already on login page
      if (!window.location.pathname.includes('login')) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.');
        window.location.href = '/login';
      } else {
        toast.error('Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.');
      }
    }
    else {
      // Show error message from response if available
      const errorMessage = error.response?.data && typeof error.response.data === 'object' 
        ? (error.response.data as any).message || 'Ein Fehler ist aufgetreten'
        : 'Ein Fehler ist aufgetreten';
      
      toast.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: async (email: string, password: string) => {
    console.log('Login attempt for:', email);
    try {
      const response = await apiClient.post('/api/auth/login.php', { email, password });
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  verify2FA: async (userId: string, otp: string) => {
    console.log('2FA verification for user:', userId);
    try {
      const response = await apiClient.post('/api/auth/verify.php', { user_id: userId, otp });
      console.log('2FA response:', response.data);
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('2FA verification error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      console.log('Logging out...');
      await apiClient.get('/api/auth/logout.php');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('Logout complete');
    }
  },
  
  requestPasswordReset: async (email: string) => {
    console.log('Password reset request for:', email);
    try {
      const response = await apiClient.post('/api/auth/reset-password.php', { email });
      console.log('Reset request response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },
  
  resetPassword: async (email: string, resetCode: string, newPassword: string) => {
    console.log('Password reset confirmation for:', email);
    try {
      const response = await apiClient.post('/api/auth/reset-password.php', { 
        email, 
        reset_code: resetCode, 
        new_password: newPassword 
      });
      console.log('Reset confirmation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      throw error;
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

// Filiale service
export const filialeService = {
  getFilialen: async () => {
    const response = await apiClient.get('/api/filialen/list.php');
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
  },
  
  testSipConnection: async (settings: {
    sipServer: string;
    sipPort: string;
    sipUser: string;
    sipPassword: string;
    outboundProxy?: string;
    transport?: string;
    useSrtp?: boolean;
  }, filialeId?: string) => {
    const data = {
      settings,
      filiale_id: filialeId
    };
    
    const response = await apiClient.post('/api/settings/test-sip.php', data);
    return response.data;
  },
  
  testVpnConnection: async (settings: {
    vpnServer: string;
    vpnPort: string;
    vpnProtocol: string;
    vpnUsername?: string;
    vpnPassword?: string;
    vpnCertificate?: string;
  }, filialeId?: string) => {
    const data = {
      settings,
      filiale_id: filialeId
    };
    
    const response = await apiClient.post('/api/settings/test-vpn.php', data);
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
