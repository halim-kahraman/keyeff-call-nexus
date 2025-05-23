import axios, { AxiosError } from 'axios';
import { toast } from "sonner";

// Get current URL components for better environment detection
const currentHost = window.location.hostname;
const currentPort = window.location.port;
const isLovablePreview = currentHost.includes('lovable');

// API configuration - optimized for both local development and Lovable preview
const API_URL = (() => {
  console.log('Environment detection:', {
    hostname: currentHost,
    port: currentPort,
    isLovablePreview
  });
  
  // For Lovable preview, use a mock API URL since backend is not available
  if (isLovablePreview) {
    console.log('Running in Lovable preview - using mock API mode');
    return '/api';  // This will be intercepted for demo purposes
  }
  
  // For local development
  return 'http://localhost/keyeff_callpanel/backend';
})();

console.log('API URL configured as:', API_URL);

// Create axios instance with updated configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Set withCredentials to allow cookies across domains for proper authentication
  withCredentials: true,
});

// Flag to detect if we're in mock mode (Lovable preview)
const isMockMode = isLovablePreview;

// Add request interceptor to add token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Log the request for debugging
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // In mock mode, simulate responses directly
    if (isMockMode) {
      console.log('Mock mode active - request will be intercepted');
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor with mock handling for Lovable preview
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error: AxiosError) => {
    console.error('API Error:', error);
    
    // Handle mock mode for Lovable preview
    if (isMockMode) {
      console.log('Mock mode activated - generating demo response');
      
      // Extract endpoint from URL
      const url = error.config?.url || '';
      
      // Handle login mock
      if (url.includes('login.php')) {
        const requestData = error.config?.data ? JSON.parse(error.config.data) : {};
        const { email, password } = requestData;
        
        // Check if credentials match demo accounts
        const demoUsers = {
          'admin@keyeff.de': { id: 'demo_admin', name: 'Admin User', role: 'admin' },
          'telefonist@keyeff.de': { id: 'demo_telefonist', name: 'Telefonist User', role: 'telefonist' },
          'filialleiter@keyeff.de': { id: 'demo_filialleiter', name: 'Filialleiter User', role: 'filialleiter' }
        };
        
        if (demoUsers[email] && password === 'password') {
          // Successful login - return needs_verification with OTP
          console.log('Demo login successful for:', email);
          return Promise.resolve({
            data: {
              success: true, 
              message: 'OTP generated successfully',
              data: {
                needs_verification: true,
                user_id: demoUsers[email].id,
                otp: '123456' // Demo OTP
              }
            }
          });
        }
        
        console.log('Demo login failed for:', email);
        // Invalid credentials
        return Promise.reject({
          response: {
            status: 401,
            data: {
              success: false,
              message: 'Invalid credentials'
            }
          }
        });
      }
      
      // Handle 2FA verification mock
      if (url.includes('verify.php')) {
        const requestData = error.config?.data ? JSON.parse(error.config.data) : {};
        const { user_id, otp } = requestData;
        
        // Extract user info from id
        const demoUsers = {
          'demo_admin': { id: 'demo_admin', name: 'Admin User', role: 'admin', email: 'admin@keyeff.de' },
          'demo_telefonist': { id: 'demo_telefonist', name: 'Telefonist User', role: 'telefonist', email: 'telefonist@keyeff.de' },
          'demo_filialleiter': { id: 'demo_filialleiter', name: 'Filialleiter User', role: 'filialleiter', email: 'filialleiter@keyeff.de' }
        };
        
        // In mock mode, accept any valid demo user ID
        if (demoUsers[user_id]) {
          console.log('Demo 2FA successful for user ID:', user_id);
          
          // Generate a demo token
          const token = `demo_token_${Math.random().toString(36).substring(2)}`;
          
          return Promise.resolve({
            data: {
              success: true,
              message: 'Login successful',
              data: {
                token,
                user: demoUsers[user_id]
              }
            }
          });
        }
        
        console.log('Demo 2FA failed for user ID:', user_id);
        return Promise.reject({
          response: {
            status: 401,
            data: {
              success: false,
              message: 'Invalid verification code'
            }
          }
        });
      }
      
      // For any other API in mock mode, return generic success
      console.log('Generic mock response for:', url);
      return Promise.resolve({
        data: {
          success: true,
          message: 'Mock API response',
          data: {}
        }
      });
    }
    
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: async (email: string, password: string) => {
    console.log('Login attempt for:', email);
    try {
      // For Lovable preview, handle demo users directly to avoid network requests
      if (isMockMode) {
        const demoUsers = {
          'admin@keyeff.de': { id: 'demo_admin', name: 'Admin User', role: 'admin' },
          'telefonist@keyeff.de': { id: 'demo_telefonist', name: 'Telefonist User', role: 'telefonist' },
          'filialleiter@keyeff.de': { id: 'demo_filialleiter', name: 'Filialleiter User', role: 'filialleiter' }
        };
        
        if (demoUsers[email] && password === 'password') {
          console.log('Direct mock login successful for:', email);
          return {
            success: true, 
            message: 'OTP generated successfully',
            data: {
              needs_verification: true,
              user_id: demoUsers[email].id,
              otp: '123456' // Demo OTP
            }
          };
        } else {
          console.log('Direct mock login failed for:', email);
          throw {
            response: {
              status: 401,
              data: {
                success: false,
                message: 'Invalid credentials'
              }
            }
          };
        }
      }
      
      const response = await apiClient.post('/api/auth/login.php', { email, password });
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },
  
  verify2FA: async (userId: string, otp: string) => {
    console.log('2FA verification for user:', userId);
    try {
      // For Lovable preview, handle demo users directly
      if (isMockMode) {
        const demoUsers = {
          'demo_admin': { id: 'demo_admin', name: 'Admin User', role: 'admin', email: 'admin@keyeff.de' },
          'demo_telefonist': { id: 'demo_telefonist', name: 'Telefonist User', role: 'telefonist', email: 'telefonist@keyeff.de' },
          'demo_filialleiter': { id: 'demo_filialleiter', name: 'Filialleiter User', role: 'filialleiter', email: 'filialleiter@keyeff.de' }
        };
        
        if (demoUsers[userId]) {
          console.log('Direct mock 2FA successful for:', userId);
          // Generate a demo token
          const token = `demo_token_${Math.random().toString(36).substring(2)}`;
          
          // Save token and user in localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(demoUsers[userId]));
          
          return {
            success: true,
            message: 'Login successful',
            data: {
              token,
              user: demoUsers[userId]
            }
          };
        } else {
          console.log('Direct mock 2FA failed for:', userId);
          throw {
            response: {
              status: 401,
              data: {
                success: false,
                message: 'Invalid verification code'
              }
            }
          };
        }
      }
      
      const response = await apiClient.post('/api/auth/verify.php', { user_id: userId, otp });
      console.log('2FA response:', response.data);
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('2FA verification error:', error);
      if (error.response?.data) {
        throw error.response.data;
      }
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
