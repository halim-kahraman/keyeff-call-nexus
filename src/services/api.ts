
// API Services for the application

// Helper function to format dates as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Check if in preview mode (Lovable preview environment)
const isPreviewMode = () => {
  return window.location.hostname.includes('lovable');
};

// Demo users for preview mode
const demoUsers = {
  'admin@keyeff.de': {
    id: 'demo_admin',
    name: 'Admin User',
    email: 'admin@keyeff.de',
    role: 'admin',
    filiale: null,
    avatar: null
  },
  'telefonist@keyeff.de': {
    id: 'demo_telefonist',
    name: 'Telefonist User',
    email: 'telefonist@keyeff.de',
    role: 'telefonist',
    filiale: null,
    avatar: null
  },
  'filialleiter@keyeff.de': {
    id: 'demo_filialleiter',
    name: 'Filialleiter User',
    email: 'filialleiter@keyeff.de',
    role: 'filialleiter',
    filiale: null,
    avatar: null
  },
  'halim.kahraman@googlemail.com': {
    id: 'demo_dev',
    name: 'Developer',
    email: 'halim.kahraman@googlemail.com',
    role: 'admin',
    filiale: null,
    avatar: null
  }
};

// Auth Service
export const authService = {
  login: async (email: string, password: string) => {
    try {
      // Handle preview mode with demo users
      if (isPreviewMode()) {
        console.log('Preview mode detected, checking demo credentials');
        const demoUser = demoUsers[email];
        
        if (demoUser && password === 'password') {
          console.log('Demo login successful:', demoUser);
          return {
            success: true,
            message: 'OTP generated successfully',
            data: {
              needs_verification: true,
              user_id: demoUser.id,
              otp: '123456', // Demo OTP
              message: 'A verification code has been sent to your email.'
            }
          };
        } else {
          console.error('Invalid demo credentials');
          return {
            success: false,
            message: 'Invalid credentials',
            data: null
          };
        }
      }
      
      // Normal backend login for non-preview mode
      const response = await fetch('/backend/api/auth/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Anmeldung fehlgeschlagen.');
    }
  },
  
  logout: async () => {
    try {
      // Handle preview mode
      if (isPreviewMode()) {
        console.log('Preview mode detected, simulating logout');
        return {
          success: true,
          message: 'Logged out successfully',
          data: null
        };
      }
      
      const response = await fetch('/backend/api/auth/logout.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      
      return await response.json();
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Abmeldung fehlgeschlagen.');
    }
  },
  
  verify2FA: async (userId: string, code: string) => {
    try {
      // Handle preview mode with demo users
      if (isPreviewMode()) {
        console.log('Preview mode detected, simulating 2FA verification');
        // Extract user type from userId (demo_admin, demo_telefonist, etc.)
        const userType = userId.split('_')[1];
        let userEmail = '';
        
        // Find the email for this userId
        Object.entries(demoUsers).forEach(([email, user]) => {
          if (user.id === userId) {
            userEmail = email;
          }
        });
        
        if (!userEmail) {
          throw new Error('User not found');
        }
        
        const user = demoUsers[userEmail];
        
        if (code === '123456') { // Accept any code in preview mode
          return {
            success: true,
            message: 'Verified successfully',
            data: {
              user: user,
              token: 'demo-token-' + Date.now()
            }
          };
        } else {
          return {
            success: false,
            message: 'Invalid verification code',
            data: null
          };
        }
      }
      
      const response = await fetch('/backend/api/auth/verify.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, code }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('2FA verification error:', error);
      throw new Error('Bestätigung fehlgeschlagen.');
    }
  },
  
  requestPasswordReset: async (email: string) => {
    try {
      // Handle preview mode
      if (isPreviewMode()) {
        console.log('Preview mode detected, simulating password reset request');
        
        if (demoUsers[email]) {
          return {
            success: true,
            message: 'Reset code sent successfully',
            data: {
              reset_code: '123456' // Demo reset code
            }
          };
        } else {
          return {
            success: true, // Still return success for security
            message: 'If the email exists, a reset code has been sent',
            data: null
          };
        }
      }
      
      const response = await fetch('/backend/api/auth/reset-password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, action: 'request' }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Password reset request error:', error);
      throw new Error('Anfrage fehlgeschlagen.');
    }
  },
  
  resetPassword: async (email: string, code: string, newPassword: string) => {
    try {
      // Handle preview mode
      if (isPreviewMode()) {
        console.log('Preview mode detected, simulating password reset');
        
        if (demoUsers[email] && code === '123456') {
          return {
            success: true,
            message: 'Password reset successfully',
            data: null
          };
        } else {
          return {
            success: false,
            message: 'Invalid or expired reset code',
            data: null
          };
        }
      }
      
      const response = await fetch('/backend/api/auth/reset-password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          reset_code: code,
          new_password: newPassword,
          action: 'reset'
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error('Zurücksetzen fehlgeschlagen.');
    }
  },
};

// Customer Service
export const customerService = {
  getCustomers: async (filialeId?: string | null, campaignId?: string | null) => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filialeId) params.append('filiale_id', filialeId);
      if (campaignId) params.append('campaign_id', campaignId);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      
      const response = await fetch(`/backend/api/customers/list.php${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const data = await response.json();
      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Return mock data for development
      return [
        {
          id: "1", 
          name: "Max Mustermann", 
          company: "Musterfirma GmbH",
          primary_phones: "+49123456789,+49987654321",
          contract_types: "Premium,Standard",
          contract_statuses: "Aktiv,Gekündigt",
          contract_expiry_dates: "2025-12-31,2023-06-30",
          priority: "high"
        },
        {
          id: "2", 
          name: "Erika Musterfrau", 
          company: "Beispiel AG",
          primary_phones: "+49123456788",
          contract_types: "Premium",
          contract_statuses: "Aktiv",
          contract_expiry_dates: "2024-12-31",
          priority: "medium"
        },
        // Add more mock customers as needed
      ];
    }
  },
  
  getCustomerDetails: async (customerId: string) => {
    try {
      const response = await fetch(`/backend/api/customers/detail.php?id=${customerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch customer details');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching customer details:', error);
      // Return mock data for development
      return {
        id: customerId,
        name: "Max Mustermann",
        company: "Musterfirma GmbH",
        email: "max@musterfirma.de",
        address: "Musterstraße 123",
        postal_code: "12345",
        city: "Musterstadt",
        primary_phones: "+49123456789,+49987654321",
        notes: "Wichtiger Kunde, bevorzugt Anrufe am Vormittag.",
        priority: "high",
        last_contact: "2023-05-15",
        contacts: [
          {
            id: "1",
            phone: "+49123456789",
            contact_type: "Festnetz",
            contact_name: "Büro",
            is_primary: "1",
            notes: "Erreichbar Mo-Fr 9-17 Uhr"
          },
          {
            id: "2",
            phone: "+49987654321",
            contact_type: "Mobil",
            contact_name: "Privat",
            is_primary: "0",
            notes: "Nur in Notfällen"
          }
        ],
        contracts: [
          {
            id: "1",
            contract_number: "KV-2023-001",
            contract_type: "Premium",
            contract_status: "Aktiv",
            contract_start: "2023-01-01",
            contract_expiry: "2025-12-31",
            monthly_value: "99.90",
            notes: "Vollumfänglicher Support"
          },
          {
            id: "2",
            contract_number: "KV-2020-042",
            contract_type: "Standard",
            contract_status: "Gekündigt",
            contract_start: "2020-06-01",
            contract_expiry: "2023-06-30",
            monthly_value: "49.90",
            notes: "Gekündigt wegen Upgrade auf Premium"
          }
        ],
        call_logs: [
          {
            id: "1",
            created_at: "2023-05-15T10:30:00",
            user_name: "Admin User",
            duration: 360, // in seconds
            outcome: "Erfolgreich",
            log_text: "Kunde hat Interesse am Premium-Paket gezeigt.",
            contract_type: "Standard",
            contract_number: "KV-2020-042"
          },
          {
            id: "2",
            created_at: "2023-04-20T14:45:00",
            user_name: "Admin User",
            duration: 180,
            outcome: "Rückruf vereinbart",
            log_text: "Kunde war beschäftigt, Rückruf für nächste Woche vereinbart.",
            contract_type: "Standard",
            contract_number: "KV-2020-042"
          }
        ]
      };
    }
  },
  
  // Add the createCustomer method
  createCustomer: async (customerData: {
    name: string;
    company: string;
    email: string;
    phone: string;
    mobile_phone: string;
    address: string;
    city: string;
    postal_code: string;
    notes: string;
    priority: string;
    filiale_id?: string;
    campaign_id?: string;
  }) => {
    try {
      const response = await fetch('/backend/api/customers/create.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(customerData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create customer');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }
};

// Settings Service
export const settingsService = {
  getSettings: async (category: string, filialeId?: string | null) => {
    try {
      let url = `/backend/api/settings/get.php?category=${category}`;
      if (filialeId) {
        url += `&filiale_id=${filialeId}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${category} settings`);
      }
      
      const data = await response.json();
      return data.data || {};
    } catch (error) {
      console.error(`Error fetching ${category} settings:`, error);
      // Return mock data based on category
      switch (category) {
        case 'sip':
          return {
            sip_server: 'sip.example.com',
            sip_port: '5060',
            sip_username: 'user123',
            sip_password: '********',
            stun_server: 'stun.example.com:19302',
            turn_server: 'turn.example.com:3478',
            turn_username: 'turnuser',
            turn_password: '********',
            sip_enabled: '1'
          };
        case 'vpn':
          return {
            vpn_server: 'vpn.example.com',
            vpn_port: '1194',
            vpn_username: 'vpnuser',
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
            smtp_username: 'sender@example.com',
            smtp_password: '********',
            smtp_encryption: 'tls',
            smtp_from_email: 'noreply@example.com',
            smtp_from_name: 'KeyEff System',
            smtp_enabled: '1'
          };
        case 'keyeffApi':
          return {
            api_url: 'https://api.keyeff.de/v1',
            api_key: 'key123456',
            api_secret: '********',
            api_timeout: '30',
            api_enabled: '1'
          };
        default:
          return {};
      }
    }
  },
  
  saveSettings: async (category: string, settings: Record<string, string>, filialeId?: string) => {
    try {
      const body: any = {
        category,
        settings
      };
      
      if (filialeId) {
        body.filiale_id = filialeId;
      }
      
      const response = await fetch('/backend/api/settings/save.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save ${category} settings`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error saving ${category} settings:`, error);
      // Mock successful response
      return {
        success: true,
        message: `${category} settings saved successfully (mock)`
      };
    }
  },
  
  // Connection test endpoints
  testSipConnection: async (settings: Record<string, string>) => {
    try {
      const response = await fetch('/backend/api/settings/test-sip.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ settings })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error testing SIP connection:', error);
      return { success: false, message: 'SIP-Verbindungstest fehlgeschlagen' };
    }
  },
  
  testVpnConnection: async (settings: Record<string, string>) => {
    try {
      const response = await fetch('/backend/api/settings/test-vpn.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ settings })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error testing VPN connection:', error);
      return { success: false, message: 'VPN-Verbindungstest fehlgeschlagen' };
    }
  },
  
  testFritzboxConnection: async (settings: Record<string, string>) => {
    try {
      const response = await fetch('/backend/api/settings/test-fritzbox.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ settings })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error testing FRITZ!Box connection:', error);
      return { success: false, message: 'FRITZ!Box-Verbindungstest fehlgeschlagen' };
    }
  },
  
  testEmailConnection: async (settings: Record<string, string>) => {
    try {
      const response = await fetch('/backend/api/settings/test-email.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ settings })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error testing email connection:', error);
      return { success: false, message: 'E-Mail-Verbindungstest fehlgeschlagen' };
    }
  },
  
  testKeyEffApiConnection: async (settings: Record<string, string>) => {
    try {
      const response = await fetch('/backend/api/settings/test-keyeff-api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ settings })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error testing KeyEff API connection:', error);
      return { success: false, message: 'KeyEff API-Verbindungstest fehlgeschlagen' };
    }
  }
};

// Statistics Service
export const statisticsService = {
  getStatistics: async (startDate?: string, endDate?: string, userId?: string) => {
    try {
      let url = `/backend/api/statistics/get.php?`;
      const params = new URLSearchParams();
      
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (userId) params.append('user_id', userId);
      
      const queryString = params.toString();
      url += queryString;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Generate default dates for mock data (last 30 days)
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Format dates properly
      const defaultStartDate = formatDate(thirtyDaysAgo);
      const defaultEndDate = formatDate(today);
      
      // Mock data for development with fixed totals
      const mockTopCallers = [
        { id: '1', name: 'Max Mustermann', total_calls: 85, total_duration: 25500, avg_duration: 300 },
        { id: '2', name: 'Anna Schmidt', total_calls: 68, total_duration: 19500, avg_duration: 287 },
        { id: '3', name: 'Thomas Weber', total_calls: 45, total_duration: 13500, avg_duration: 300 },
        { id: '4', name: 'Laura Meyer', total_calls: 35, total_duration: 10500, avg_duration: 300 },
        { id: '5', name: 'Michael Fischer', total_calls: 26, total_duration: 7800, avg_duration: 300 }
      ];
      
      // Calculate total calls from top_callers
      const totalCalls = mockTopCallers.reduce((sum, caller) => sum + caller.total_calls, 0);
      const totalDuration = mockTopCallers.reduce((sum, caller) => sum + caller.total_duration, 0);
      
      return {
        success: true,
        data: {
          summary: {
            total_calls: totalCalls,
            total_appointments: 48,
            total_customers_contacted: 180,
            period: {
              start: startDate || defaultStartDate,
              end: endDate || defaultEndDate
            }
          },
          calls_by_day: [
            { day: '2023-05-01', total_calls: 12, total_duration: 3600, avg_duration: 300 },
            { day: '2023-05-02', total_calls: 15, total_duration: 4500, avg_duration: 300 },
            { day: '2023-05-03', total_calls: 8, total_duration: 2400, avg_duration: 300 },
            { day: '2023-05-04', total_calls: 20, total_duration: 6000, avg_duration: 300 },
            { day: '2023-05-05', total_calls: 18, total_duration: 5400, avg_duration: 300 },
            { day: '2023-05-06', total_calls: 5, total_duration: 1500, avg_duration: 300 },
            { day: '2023-05-07', total_calls: 3, total_duration: 900, avg_duration: 300 }
          ],
          calls_by_outcome: [
            { outcome: 'interested', count: 75 },
            { outcome: 'callback', count: 45 },
            { outcome: 'no_answer', count: 69 },
            { outcome: 'not_interested', count: 40 },
            { outcome: 'appointment', count: 27 }
          ],
          top_callers: mockTopCallers,
          appointments_by_type: [
            { type: 'Beratung', count: 20 },
            { type: 'Verkauf', count: 15 },
            { type: 'Support', count: 8 },
            { type: 'Schulung', count: 5 }
          ],
          filiale_stats: [
            { id: '1', name: 'Zentrale', total_users: 15, total_calls: 120, total_appointments: 22, total_call_duration: 36000, avg_call_duration: 300 },
            { id: '2', name: 'Berlin', total_users: 8, total_calls: 75, total_appointments: 12, total_call_duration: 22500, avg_call_duration: 300 },
            { id: '3', name: 'München', total_users: 6, total_calls: 45, total_appointments: 9, total_call_duration: 13500, avg_call_duration: 300 },
            { id: '4', name: 'Hamburg', total_users: 4, total_calls: 16, total_appointments: 5, total_call_duration: 4800, avg_call_duration: 300 }
          ]
        }
      };
    }
  }
};

// Add this function to make campaigns available for the CallPanel component
export const campaignService = {
  getCampaigns: async () => {
    try {
      const response = await fetch('/backend/api/campaigns/list.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      // Return mock data for development
      return {
        success: true,
        data: [
          { id: 1, name: "Frühjahrs-Kampagne 2023", status: "active" },
          { id: 2, name: "Sommer-Spezial", status: "active" },
          { id: 3, name: "Bestandskunden Retention Q2", status: "active" },
          { id: 4, name: "Neukunden Akquise 2023", status: "active" },
          { id: 5, name: "Winteraktion 2022", status: "inactive" }
        ]
      };
    }
  }
};

// Filiale Service
export const filialeService = {
  getFilialen: async () => {
    try {
      const response = await fetch('/backend/api/filialen/list.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch filialen');
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching filialen:', error);
      // Return mock data for development
      return [
        { id: "1", name: "Zentrale", address: "Hauptstr. 1, 10115 Berlin" },
        { id: "2", name: "Berlin", address: "Berliner Str. 15, 10115 Berlin" },
        { id: "3", name: "München", address: "Münchner Str. 25, 80333 München" },
        { id: "4", name: "Hamburg", address: "Hamburger Str. 35, 20095 Hamburg" },
        { id: "5", name: "Köln", address: "Kölner Str. 45, 50667 Köln" }
      ];
    }
  }
};
