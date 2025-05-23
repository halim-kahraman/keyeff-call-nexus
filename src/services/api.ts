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
  
  // Connection test endpoints
  if (url.includes('test-sip.php')) {
    return {
      success: true,
      message: 'SIP connection successful',
      data: {
        connected: true,
        server: data.settings.sip_server,
        registrationTime: new Date().toISOString()
      }
    };
  }

  if (url.includes('test-vpn.php')) {
    return {
      success: true,
      message: 'VPN connection successful',
      data: {
        connected: true,
        server: data.settings.vpn_server,
        ip: '10.0.0.1'
      }
    };
  }

  if (url.includes('test-fritzbox.php')) {
    return {
      success: true,
      message: 'FRITZ!Box connection successful',
      data: {
        connected: true,
        ip: data.settings.fritzbox_ip,
        model: 'FRITZ!Box 7590',
        firmware: '7.31'
      }
    };
  }

  if (url.includes('test-email.php')) {
    return {
      success: true,
      message: 'Email connection successful',
      data: {
        connected: true,
        server: data.settings.smtp_server,
        sent: true
      }
    };
  }

  if (url.includes('test-keyeff-api.php')) {
    return {
      success: true,
      message: 'KeyEff API connection successful',
      data: {
        connected: true,
        api_version: '1.2.3',
        endpoints: ['customers', 'contracts', 'orders']
      }
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
  getCustomers: (filialeId?: string | number | null, campaignId?: string | number | null) => {
    // Demo implementation - in real app would call API
    return Promise.resolve([
      {
        id: 1,
        name: "Max Mustermann",
        company: "Mustermann GmbH",
        email: "max@mustermann.de",
        primary_phones: "+49 123 456789,+49 987 654321",
        address: "Musterstraße 1",
        city: "München",
        postal_code: "80333",
        contract_types: "Premium,Basic",
        contract_statuses: "Aktiv,Gekündigt",
        contract_expiry_dates: "2025-12-31,2023-06-30",
        monthly_value: "99.90",
        priority: "high",
        last_contact: "2023-05-15"
      },
      {
        id: 2,
        name: "Anna Schmidt",
        company: "Schmidt & Partner",
        email: "anna@schmidt-partner.de",
        primary_phones: "+49 555 123456",
        address: "Schmidtweg 42",
        city: "Berlin",
        postal_code: "10115",
        contract_types: "Business",
        contract_statuses: "Aktiv",
        contract_expiry_dates: "2026-03-15",
        monthly_value: "149.90",
        priority: "medium",
        last_contact: "2023-06-20"
      }
    ]);
  },
  
  getCustomerById: (id: number | string) => {
    // Demo implementation - in real app would call API
    return Promise.resolve({
      id: 1,
      name: "Max Mustermann",
      company: "Mustermann GmbH",
      email: "max@mustermann.de",
      address: "Musterstraße 1",
      city: "München",
      postal_code: "80333",
      priority: "high",
      last_contact: "2023-05-15",
      notes: "Wichtiger Kunde mit mehreren Standorten in Deutschland.",
      contacts: [
        {
          id: 1,
          contact_type: "Büro",
          contact_name: "Zentrale",
          phone: "+49 123 456789",
          is_primary: "1",
          notes: "9-17 Uhr erreichbar"
        },
        {
          id: 2,
          contact_type: "Mobil",
          contact_name: "Max Mustermann",
          phone: "+49 987 654321",
          is_primary: "0",
          notes: ""
        }
      ],
      contracts: [
        {
          id: 1,
          contract_number: "KE-2023-001",
          contract_type: "Premium",
          contract_status: "Aktiv",
          contract_start: "2023-01-01",
          contract_expiry: "2025-12-31",
          monthly_value: "99.90",
          notes: "Inkl. 24/7 Support"
        },
        {
          id: 2,
          contract_number: "KE-2021-055",
          contract_type: "Basic",
          contract_status: "Gekündigt",
          contract_start: "2021-06-01",
          contract_expiry: "2023-06-30",
          monthly_value: "39.90",
          notes: "Wurde durch Premium ersetzt"
        }
      ],
      call_logs: [
        {
          id: 1,
          created_at: "2023-05-15T10:30:00",
          user_name: "Thomas Berater",
          duration: 350,
          outcome: "Erfolgreich",
          contract_type: "Premium",
          contract_number: "KE-2023-001",
          log_text: "Kunde hat Interesse an Vertragsverlängerung. Angebot wurde zugesendet."
        },
        {
          id: 2,
          created_at: "2023-03-22T14:15:00",
          user_name: "Sarah Support",
          duration: 180,
          outcome: "Information",
          contract_type: "Basic",
          contract_number: "KE-2021-055",
          log_text: "Kunde hat nach Upgradeoption gefragt. Details zum Premium-Paket wurden besprochen."
        }
      ]
    });
  },
  
  getCampaigns: (filialeId?: string | number | null) => {
    // Demo implementation - in real app would call API
    return Promise.resolve([
      { id: 1, name: "Frühjahrsaktion 2025", description: "Vertragsverlängerungen für Q2 2025" },
      { id: 2, name: "Neukunden München", description: "Neukunden aus Messe März 2025" }
    ]);
  }
};

export const callService = {
  logCall: async (data) => isMockMode ? { success: true } : (await apiClient.post('/api/calls/log.php', data)).data
};

export const appointmentService = {
  createAppointment: async (data) => isMockMode ? { success: true } : (await apiClient.post('/api/appointments/create.php', data)).data,
  getAppointments: async (startDate?, endDate?) => isMockMode ? [] : (await apiClient.get('/api/appointments/list.php')).data.data
};

export const filialeService = {
  getFilialen: async () => {
    if (isMockMode) {
      return [
        { id: "1", name: "Zentrale", address: "Hauptstr. 1, 10115 Berlin", phoneNumber: "+49 30 1234567", email: "zentrale@keyeff.de" },
        { id: "2", name: "Berlin", address: "Berliner Str. 15, 10115 Berlin", phoneNumber: "+49 30 9876543", email: "berlin@keyeff.de" },
        { id: "3", name: "München", address: "Münchner Str. 25, 80333 München", phoneNumber: "+49 89 1234567", email: "muenchen@keyeff.de" },
        { id: "4", name: "Hamburg", address: "Hamburger Str. 35, 20095 Hamburg", phoneNumber: "+49 40 1234567", email: "hamburg@keyeff.de" },
        { id: "5", name: "Köln", address: "Kölner Str. 45, 50667 Köln", phoneNumber: "+49 221 1234567", email: "koeln@keyeff.de" }
      ];
    } 
    
    return (await apiClient.get('/api/filialen/list.php')).data.data;
  }
};

export const settingsService = {
  getSettings: async (category, filialeId?) => {
    if (isMockMode) {
      // Return mock settings based on category
      switch (category) {
        case 'sip':
          return {
            sip_server: 'sip.example.com',
            sip_port: '5060',
            sip_username: 'sip_user',
            sip_password: '********',
            stun_server: 'stun.example.com',
            turn_server: 'turn.example.com',
            turn_username: 'turn_user',
            turn_password: '********',
            sip_enabled: '1'
          };
        case 'vpn':
          return {
            vpn_server: 'vpn.example.com',
            vpn_port: '1194',
            vpn_username: 'vpn_user',
            vpn_password: '********',
            vpn_enabled: '1'
          };
        case 'fritzbox':
          return {
            fritzbox_ip: '192.168.178.1',
            fritzbox_port: '443',
            fritzbox_username: 'admin',
            fritzbox_password: '********',
            fritzbox_enabled: '1'
          };
        case 'email':
          return {
            smtp_server: 'smtp.example.com',
            smtp_port: '587',
            smtp_username: 'info@keyeff.de',
            smtp_password: '********',
            smtp_encryption: 'tls',
            smtp_from_email: 'info@keyeff.de',
            smtp_from_name: 'KeyEff Call',
            smtp_enabled: '1'
          };
        case 'keyeffApi':
          return {
            api_url: 'https://api.keyeff.de/v1',
            api_key: 'demo_key_12345',
            api_secret: '********',
            api_timeout: '30',
            api_enabled: '1'
          };
        default:
          return {};
      }
    } 
    
    return (await apiClient.get(`/api/settings/get.php?category=${category}${filialeId ? `&filiale_id=${filialeId}` : ''}`)).data.data;
  },
  
  saveSettings: async (category, settings, filialeId?) => isMockMode ? 
    { success: true, message: 'Settings saved successfully (mock)', data: settings } : 
    (await apiClient.post('/api/settings/save.php', { category, settings, filiale_id: filialeId })).data,
  
  testSipConnection: async (settings) => {
    if (isMockMode) {
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'SIP connection successful (mock)',
        data: {
          connected: true,
          server: settings.sip_server,
          registrationTime: new Date().toISOString()
        }
      };
    }
    
    return (await apiClient.post('/api/settings/test-sip.php', { settings })).data;
  },
  
  testVpnConnection: async (settings) => {
    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'VPN connection successful (mock)',
        data: {
          connected: true,
          server: settings.vpn_server,
          ip: '10.0.0.1'
        }
      };
    }
    
    return (await apiClient.post('/api/settings/test-vpn.php', { settings })).data;
  },
  
  testFritzboxConnection: async (settings) => {
    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'FRITZ!Box connection successful (mock)',
        data: {
          connected: true,
          ip: settings.fritzbox_ip,
          model: 'FRITZ!Box 7590',
          firmware: '7.31'
        }
      };
    }
    
    return (await apiClient.post('/api/settings/test-fritzbox.php', { settings })).data;
  },
  
  testEmailConnection: async (settings) => {
    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // If missing critical settings, return error
      if (!settings.smtp_server || !settings.smtp_username || !settings.smtp_password) {
        return Promise.reject({
          success: false,
          message: 'Email settings incomplete',
          data: {
            connected: false
          }
        });
      }
      
      return {
        success: true,
        message: 'Email connection successful (mock)',
        data: {
          connected: true,
          server: settings.smtp_server,
          sent: true
        }
      };
    }
    
    return (await apiClient.post('/api/settings/test-email.php', { settings })).data;
  },
  
  testKeyEffApiConnection: async (settings) => {
    if (isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // If missing critical settings, return error
      if (!settings.api_url || !settings.api_key || !settings.api_secret) {
        return Promise.reject({
          success: false,
          message: 'KeyEff API settings incomplete',
          data: {
            connected: false
          }
        });
      }
      
      return {
        success: true,
        message: 'KeyEff API connection successful (mock)',
        data: {
          connected: true,
          api_version: '1.2.3',
          endpoints: ['customers', 'contracts', 'orders']
        }
      };
    }
    
    return (await apiClient.post('/api/settings/test-keyeff-api.php', { settings })).data;
  }
};

export const logsService = {
  getLogs: async (filters?) => isMockMode ? [] : (await apiClient.get('/api/logs/list.php')).data.data,
  exportLogs: async (filters?) => isMockMode ? {} : (await apiClient.get('/api/logs/export.php')).data.data
};

export const statisticsService = {
  getStatistics: async (startDate?, endDate?) => isMockMode ? {} : (await apiClient.get('/api/statistics/get.php')).data.data
};

export default apiClient;
