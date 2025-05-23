
import axios, { AxiosError } from 'axios';
import { toast } from "sonner";

// Get current URL components for better environment detection
const currentHost = window.location.hostname;
const isLovablePreview = currentHost.includes('lovable');

// API configuration - optimized for both local development and Lovable preview
const API_URL = (() => {
  console.log('Environment detection:', {
    hostname: currentHost,
    isLovablePreview
  });
  
  // For Lovable preview, use a mock API URL since backend is not available
  if (isLovablePreview) {
    console.log('Running in Lovable preview - using mock API mode');
    return '/mock-api';  // This will be intercepted
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
  withCredentials: true,
});

// Flag to detect if we're in mock mode (Lovable preview)
const isMockMode = isLovablePreview;

// Demo users for mock mode
const DEMO_USERS = {
  'admin@keyeff.de': { id: 'demo_admin', name: 'Admin User', role: 'admin', email: 'admin@keyeff.de' },
  'telefonist@keyeff.de': { id: 'demo_telefonist', name: 'Telefonist User', role: 'telefonist', email: 'telefonist@keyeff.de' },
  'filialleiter@keyeff.de': { id: 'demo_filialleiter', name: 'Filialleiter User', role: 'filialleiter', email: 'filialleiter@keyeff.de' },
};

// Function to handle mock API responses
const handleMockResponse = (url, data) => {
  console.log(`🔄 Mock API: ${url}`, data);
  
  // Login endpoint
  if (url.includes('login')) {
    const { email, password } = data || {};
    
    if (DEMO_USERS[email] && password === 'password') {
      console.log('✅ Mock login successful for:', email);
      return {
        success: true,
        message: 'OTP generated successfully',
        data: {
          needs_verification: true,
          user_id: DEMO_USERS[email].id,
          otp: '123456'
        }
      };
    }
    
    console.log('❌ Mock login failed for:', email);
    throw {
      success: false,
      message: 'Invalid credentials'
    };
  }
  
  // 2FA verification endpoint
  if (url.includes('verify')) {
    const { user_id } = data || {};
    
    // Find user by ID
    const user = Object.values(DEMO_USERS).find(u => u.id === user_id);
    
    if (user) {
      console.log('✅ Mock 2FA successful for:', user.email);
      const token = `demo_token_${Math.random().toString(36).substring(2)}`;
      
      return {
        success: true,
        message: 'Login successful',
        data: {
          token,
          user
        }
      };
    }
    
    console.log('❌ Mock 2FA failed for user ID:', user_id);
    throw {
      success: false,
      message: 'Invalid verification code'
    };
  }
  
  // Password reset request endpoint
  if (url.includes('reset-password') && !data.reset_code) {
    const { email } = data || {};
    
    if (DEMO_USERS[email]) {
      console.log('✅ Mock password reset request successful for:', email);
      return {
        success: true,
        message: 'Password reset code sent',
        data: {
          reset_code: '123456'
        }
      };
    }
    
    // Even for non-existing emails, we return success for security
    return {
      success: true,
      message: 'If the email exists, a reset code has been sent'
    };
  }
  
  // Password reset confirmation endpoint
  if (url.includes('reset-password') && data.reset_code) {
    const { email, reset_code } = data || {};
    
    if (DEMO_USERS[email] && reset_code === '123456') {
      console.log('✅ Mock password reset successful for:', email);
      return {
        success: true,
        message: 'Password reset successful'
      };
    }
    
    throw {
      success: false,
      message: 'Invalid reset code'
    };
  }
  
  // Fallback for other endpoints
  return {
    success: true,
    message: 'Mock API operation successful',
    data: {}
  };
};

// Intercept requests in mock mode
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log request details
    console.log(`📤 Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses and mock responses
apiClient.interceptors.response.use(
  (response) => {
    console.log(`📥 Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error: AxiosError) => {
    // Only use mock mode for lovable preview
    if (isMockMode) {
      const url = error.config?.url || '';
      const data = error.config?.data ? JSON.parse(error.config.data) : {};
      
      try {
        // Generate mock response
        const mockResponse = handleMockResponse(url, data);
        return Promise.resolve({ data: mockResponse });
      } catch (mockError) {
        return Promise.reject({ response: { data: mockError } });
      }
    }
    
    console.error('❌ API Error:', error);
    return Promise.reject(error);
  }
);

// Auth service with improved mock handling
export const authService = {
  login: async (email: string, password: string) => {
    console.log('Login attempt for:', email);
    
    try {
      // Direct mock handling in Lovable preview
      if (isMockMode) {
        if (DEMO_USERS[email] && password === 'password') {
          console.log('✅ Direct mock login successful for:', email);
          return {
            success: true, 
            message: 'OTP generated successfully',
            data: {
              needs_verification: true,
              user_id: DEMO_USERS[email].id,
              otp: '123456'
            }
          };
        } else {
          console.log('❌ Direct mock login failed for:', email);
          throw {
            success: false,
            message: 'Invalid credentials'
          };
        }
      }
      
      // Real API request for non-preview environments
      const response = await apiClient.post('/api/auth/login.php', { email, password });
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.data) {
        throw error.response.data;
      }
      if (error.success === false) {
        throw error;
      }
      throw { success: false, message: 'Network error' };
    }
  },
  
  verify2FA: async (userId: string, otp: string) => {
    console.log('2FA verification for user:', userId);
    
    try {
      // Direct mock handling in Lovable preview
      if (isMockMode) {
        // Find user by ID
        const user = Object.values(DEMO_USERS).find(u => u.id === userId);
        
        if (user) {
          console.log('✅ Direct mock 2FA successful for:', user.email);
          const token = `demo_token_${Math.random().toString(36).substring(2)}`;
          
          return {
            success: true,
            message: 'Login successful',
            data: {
              token,
              user
            }
          };
        } else {
          console.log('❌ Direct mock 2FA failed for:', userId);
          throw {
            success: false,
            message: 'Invalid verification code'
          };
        }
      }
      
      // Real API request for non-preview environments
      const response = await apiClient.post('/api/auth/verify.php', { user_id: userId, otp });
      return response.data;
    } catch (error: any) {
      console.error('2FA verification error:', error);
      if (error.response?.data) {
        throw error.response.data;
      }
      if (error.success === false) {
        throw error;
      }
      throw { success: false, message: 'Network error' };
    }
  },
  
  logout: async () => {
    try {
      if (!isMockMode) {
        await apiClient.get('/api/auth/logout.php');
      }
      return { success: true };
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  
  requestPasswordReset: async (email: string) => {
    try {
      if (isMockMode) {
        if (DEMO_USERS[email]) {
          return {
            success: true,
            message: 'Password reset code sent',
            data: {
              reset_code: '123456'
            }
          };
        }
        return {
          success: true,
          message: 'If the email exists, a reset code has been sent'
        };
      }
      
      const response = await apiClient.post('/api/auth/reset-password.php', { email });
      return response.data;
    } catch (error: any) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },
  
  resetPassword: async (email: string, resetCode: string, newPassword: string) => {
    try {
      if (isMockMode) {
        if (DEMO_USERS[email] && resetCode === '123456') {
          return {
            success: true,
            message: 'Password reset successful'
          };
        }
        throw {
          success: false,
          message: 'Invalid reset code'
        };
      }
      
      const response = await apiClient.post('/api/auth/reset-password.php', { 
        email, 
        reset_code: resetCode, 
        new_password: newPassword 
      });
      return response.data;
    } catch (error: any) {
      console.error('Password reset confirmation error:', error);
      throw error;
    }
  }
};

// For other services (just stubs for now)
export const customerService = {
  getCustomers: async () => isMockMode ? [] : (await apiClient.get('/api/customers/list.php')).data.data
};

export const callService = {
  logCall: async (data) => isMockMode ? { success: true } : (await apiClient.post('/api/calls/log.php', data)).data
};

export const appointmentService = {
  createAppointment: async (data) => isMockMode ? { success: true } : (await apiClient.post('/api/appointments/create.php', data)).data,
  getAppointments: async (startDate?, endDate?) => isMockMode ? [] : (await apiClient.get('/api/appointments/list.php')).data.data
};

export const filialeService = {
  getFilialen: async () => isMockMode ? [] : (await apiClient.get('/api/filialen/list.php')).data.data
};

export const settingsService = {
  getSettings: async (category, filialeId?) => isMockMode ? {} : (await apiClient.get(`/api/settings/get.php?category=${category}${filialeId ? `&filiale_id=${filialeId}` : ''}`)).data.data,
  saveSettings: async (category, settings, filialeId?) => isMockMode ? { success: true } : (await apiClient.post('/api/settings/save.php', { category, settings, filiale_id: filialeId })).data,
  testSipConnection: async (settings, filialeId?) => isMockMode ? { success: true } : (await apiClient.post('/api/settings/test-sip.php', { settings, filiale_id: filialeId })).data,
  testVpnConnection: async (settings, filialeId?) => isMockMode ? { success: true } : (await apiClient.post('/api/settings/test-vpn.php', { settings, filiale_id: filialeId })).data
};

export const logsService = {
  getLogs: async (filters?) => isMockMode ? [] : (await apiClient.get('/api/logs/list.php')).data.data,
  exportLogs: async (filters?) => isMockMode ? {} : (await apiClient.get('/api/logs/export.php')).data.data
};

export const statisticsService = {
  getStatistics: async (startDate?, endDate?) => isMockMode ? {} : (await apiClient.get('/api/statistics/get.php')).data.data
};

export default apiClient;
