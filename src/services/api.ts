
import axios from 'axios';
import { User } from '@/context/types/auth.types';

// Configure axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
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

// Mock auth service for development
const mockAuthService = {
  login: async (email: string, password: string) => {
    console.log("Mock login with:", email);
    
    // For testing, define some mock users
    const mockUsers = {
      "admin@keyeff.de": {
        id: "1",
        name: "Admin User",
        email: "admin@keyeff.de",
        role: "admin" as const,
      },
      "agent@keyeff.de": {
        id: "2",
        name: "Telefonist",
        email: "agent@keyeff.de",
        role: "telefonist" as const,
        filiale: "Berlin"
      },
      "manager@keyeff.de": {
        id: "3",
        name: "Filialleiter",
        email: "manager@keyeff.de",
        role: "filialleiter" as const,
        filiale: "München"
      }
    };
    
    // Simple password check
    if (password !== "password123") {
      throw new Error("Invalid credentials");
    }

    // Check if user exists
    const user = mockUsers[email as keyof typeof mockUsers];
    if (!user) {
      throw new Error("User not found");
    }
    
    // Demo: Simulate 2FA for admin
    if (user.role === 'admin') {
      return {
        success: true,
        message: "2FA required",
        data: {
          needs_verification: true,
          user_id: user.id,
          otp: "123456" // Demo OTP
        }
      };
    }
    
    // For non-admin, direct login
    return {
      success: true,
      data: {
        user: user,
        token: "mock-jwt-token"
      }
    };
  },
  
  verify2FA: async (userId: string, code: string) => {
    console.log("Verifying 2FA code:", code, "for user:", userId);
    
    // For demo purposes, accept any code
    if (code && code.length === 6) {
      return {
        success: true,
        data: {
          user: {
            id: "1",
            name: "Admin User",
            email: "admin@keyeff.de",
            role: "admin"
          },
          token: "mock-jwt-token-after-2fa"
        }
      };
    } else {
      throw new Error("Invalid verification code");
    }
  },
  
  requestPasswordReset: async (email: string) => {
    console.log("Password reset requested for:", email);
    
    // For demo purposes, always succeed
    return {
      success: true,
      message: "If the email exists, a reset code has been sent",
      data: {
        reset_code: "654321", // Demo reset code
        email_success: true
      }
    };
  },
  
  resetPassword: async (email: string, code: string, newPassword: string) => {
    console.log("Resetting password for:", email, "with code:", code);
    
    // For demo purposes, always succeed if code is correct length
    if (code && code.length === 6) {
      return {
        success: true,
        message: "Password successfully reset",
        data: {
          email_success: true
        }
      };
    } else {
      throw new Error("Invalid reset code");
    }
  },
  
  logout: async () => {
    console.log("User logged out");
    // For client-side logout, nothing needed on backend
    return { success: true };
  }
};

// Mock settings service for development
const mockSettingsService = {
  getSettings: async (category: string, filialeId?: string | null) => {
    console.log("Getting settings for:", category, "filiale:", filialeId);
    
    // For demo purposes, return mock settings based on category
    switch (category) {
      case 'sip':
        return {
          sip_server: "sip.example.com",
          sip_port: "5060",
          sip_username: "user123",
          sip_password: "password",
          stun_server: "stun.example.com",
          turn_server: "turn.example.com",
          turn_username: "turnuser",
          turn_password: "turnpass",
          sip_enabled: "1"
        };
      case 'vpn':
        return {
          vpn_server: "vpn.example.com",
          vpn_port: "1194",
          vpn_username: "vpnuser",
          vpn_password: "vpnpass",
          vpn_enabled: "1"
        };
      case 'fritzbox':
        return {
          fritzbox_ip: "192.168.178.1",
          fritzbox_port: "443",
          fritzbox_username: "admin",
          fritzbox_password: "fritzbox",
          fritzbox_enabled: "1"
        };
      case 'email':
        return {
          smtp_server: "smtp.example.com",
          smtp_port: "587",
          smtp_username: "mail@example.com",
          smtp_password: "mailpass",
          smtp_encryption: "tls",
          smtp_from_email: "noreply@keyeff.de",
          smtp_from_name: "KeyEff System",
          smtp_enabled: "1"
        };
      case 'keyeffApi':
        return {
          api_url: "https://api.keyeff.de/v1",
          api_key: "demo-key-123",
          api_secret: "demo-secret-456",
          api_timeout: "30",
          api_enabled: "1"
        };
      default:
        return {};
    }
  },
  
  saveSettings: async (category: string, settings: Record<string, string>, filialeId?: string) => {
    console.log("Saving settings for:", category, "filiale:", filialeId);
    console.log("Settings:", settings);
    
    // For demo purposes, just return success
    return {
      success: true,
      message: "Settings saved successfully"
    };
  },
  
  testSipConnection: async (settings: Record<string, string>) => {
    console.log("Testing SIP connection with settings:", settings);
    
    // For demo purposes, simulate a successful test
    return {
      success: true,
      message: "SIP connection test successful",
      details: {
        server_status: "online",
        registration_status: "registered"
      }
    };
  },
  
  testVpnConnection: async (settings: Record<string, string>) => {
    console.log("Testing VPN connection with settings:", settings);
    
    // For demo purposes, simulate a successful test
    return {
      success: true,
      message: "VPN connection test successful",
      details: {
        server_status: "connected",
        encryption: "AES-256"
      }
    };
  },
  
  testFritzboxConnection: async (settings: Record<string, string>) => {
    console.log("Testing FRITZ!Box connection with settings:", settings);
    
    // For demo purposes, simulate a successful test
    return {
      success: true,
      message: "FRITZ!Box connection test successful",
      details: {
        model: "FRITZ!Box 7590",
        firmware: "7.29"
      }
    };
  },
  
  testEmailConnection: async (settings: Record<string, string>) => {
    console.log("Testing Email connection with settings:", settings);
    
    // For demo purposes, simulate a successful test
    return {
      success: true,
      message: "Email connection test successful",
      details: {
        smtp_test: "passed",
        test_email_sent: true
      }
    };
  },
  
  testKeyEffApiConnection: async (settings: Record<string, string>) => {
    console.log("Testing KeyEff API connection with settings:", settings);
    
    // For demo purposes, simulate a successful test
    return {
      success: true,
      message: "KeyEff API connection test successful",
      details: {
        api_version: "1.0",
        permissions: ["read", "write"]
      }
    };
  }
};

// Mock customer service for development
const mockCustomerService = {
  getCustomers: async (filialeId?: string | null, campaignId?: string | null) => {
    console.log("Getting customers for filiale:", filialeId, "campaign:", campaignId);
    
    // For demo purposes, return mock customer data
    return [
      {
        id: "1",
        name: "Mustermann GmbH",
        company: "Mustermann GmbH",
        email: "info@mustermann.de",
        primary_phones: "+49 123 456789,+49 987 654321",
        contract_types: "Premium,Support",
        contract_statuses: "Aktiv,Gekündigt",
        contract_expiry_dates: "2025-12-31,2023-06-30",
        priority: "high"
      },
      {
        id: "2",
        name: "Schmidt AG",
        company: "Schmidt AG",
        email: "kontakt@schmidt-ag.de",
        primary_phones: "+49 555 123456",
        contract_types: "Standard",
        contract_statuses: "Aktiv",
        contract_expiry_dates: "2024-08-15",
        priority: "medium"
      },
      {
        id: "3",
        name: "Max Meyer",
        company: "",
        email: "max.meyer@example.com",
        primary_phones: "+49 170 9876543",
        contract_types: "Basic",
        contract_statuses: "In Bearbeitung",
        contract_expiry_dates: "2025-03-01",
        priority: "low"
      }
    ];
  },
  
  getCustomerById: async (id: string) => {
    console.log("Getting customer with ID:", id);
    
    // For demo purposes, return a mock customer based on ID
    const mockCustomers = {
      "1": {
        id: "1",
        name: "Mustermann GmbH",
        company: "Mustermann GmbH",
        email: "info@mustermann.de",
        address: "Musterstraße 1",
        city: "Berlin",
        postal_code: "10115",
        primary_phones: "+49 123 456789,+49 987 654321",
        priority: "high",
        notes: "Wichtiger Großkunde mit mehreren Standorten",
        last_contact: "2023-11-15",
        contacts: [
          {
            id: "101",
            contact_name: "Hans Mustermann",
            contact_type: "Geschäftsführer",
            phone: "+49 123 456789",
            email: "h.mustermann@mustermann.de",
            is_primary: "1",
            notes: "Bevorzugt Kontakt am Vormittag"
          },
          {
            id: "102",
            contact_name: "Maria Musterfrau",
            contact_type: "Office Manager",
            phone: "+49 987 654321",
            email: "m.musterfrau@mustermann.de",
            is_primary: "0",
            notes: ""
          }
        ],
        contracts: [
          {
            id: "201",
            contract_type: "Premium",
            contract_number: "KE-2023-001",
            contract_status: "Aktiv",
            contract_start: "2023-01-01",
            contract_expiry: "2025-12-31",
            monthly_value: "999.00",
            notes: "Vollumfänglicher Support mit 24/7 Hotline"
          },
          {
            id: "202",
            contract_type: "Support",
            contract_number: "KE-2023-002",
            contract_status: "Gekündigt",
            contract_start: "2022-07-01",
            contract_expiry: "2023-06-30",
            monthly_value: "299.00",
            notes: "Gekündigt wegen Umstellung auf Premium-Paket"
          }
        ],
        call_logs: [
          {
            id: "301",
            created_at: "2023-11-15T10:23:45",
            user_name: "Admin User",
            duration: 345,
            outcome: "Erfolgreich",
            contract_type: "Premium",
            contract_number: "KE-2023-001",
            log_text: "Kunde hat Fragen zur Rechnungsstellung. Problem geklärt und neue Rechnungskopie per E-Mail zugesandt."
          },
          {
            id: "302",
            created_at: "2023-10-22T14:15:30",
            user_name: "Telefonist",
            duration: 185,
            outcome: "Rückruf vereinbart",
            contract_type: "Support",
            contract_number: "KE-2023-002",
            log_text: "Kunde wünscht Beratung zu Premium-Upgrade. Termin mit Vertrieb für nächste Woche vereinbart."
          }
        ]
      },
      "2": {
        id: "2",
        name: "Schmidt AG",
        company: "Schmidt AG",
        email: "kontakt@schmidt-ag.de",
        address: "Schmidtstraße 42",
        city: "München",
        postal_code: "80331",
        primary_phones: "+49 555 123456",
        priority: "medium",
        notes: "Mittelgroßer Kunde mit Potential für Upselling",
        last_contact: "2023-12-05",
        contacts: [
          {
            id: "103",
            contact_name: "Peter Schmidt",
            contact_type: "IT-Leiter",
            phone: "+49 555 123456",
            email: "p.schmidt@schmidt-ag.de",
            is_primary: "1",
            notes: "Technisch sehr versiert"
          }
        ],
        contracts: [
          {
            id: "203",
            contract_type: "Standard",
            contract_number: "KE-2023-045",
            contract_status: "Aktiv",
            contract_start: "2023-08-15",
            contract_expiry: "2024-08-15",
            monthly_value: "499.00",
            notes: ""
          }
        ],
        call_logs: [
          {
            id: "303",
            created_at: "2023-12-05T09:45:12",
            user_name: "Filialleiter",
            duration: 420,
            outcome: "Information",
            contract_type: "Standard",
            contract_number: "KE-2023-045",
            log_text: "Kunde interessiert sich für zusätzliche Module. Produktinformationen per E-Mail versendet."
          }
        ]
      },
      "3": {
        id: "3",
        name: "Max Meyer",
        company: "",
        email: "max.meyer@example.com",
        address: "Meyerweg 7",
        city: "Hamburg",
        postal_code: "20095",
        primary_phones: "+49 170 9876543",
        priority: "low",
        notes: "Einzelunternehmer",
        last_contact: "2024-01-10",
        contacts: [],
        contracts: [
          {
            id: "204",
            contract_type: "Basic",
            contract_number: "",
            contract_status: "In Bearbeitung",
            contract_start: "2024-02-01",
            contract_expiry: "2025-03-01",
            monthly_value: "99.00",
            notes: "Vertrag noch nicht unterschrieben"
          }
        ],
        call_logs: [
          {
            id: "304",
            created_at: "2024-01-10T16:30:00",
            user_name: "Telefonist",
            duration: 235,
            outcome: "Nicht erreicht",
            log_text: "Kunde nicht erreichbar. Voicemail hinterlassen."
          },
          {
            id: "305",
            created_at: "2024-01-08T11:20:15",
            user_name: "Telefonist",
            duration: 310,
            outcome: "Erfolgreich",
            contract_type: "Basic",
            log_text: "Vertragsdetails besprochen. Kunde erhält Angebot per E-Mail."
          }
        ]
      }
    };
    
    return mockCustomers[id] || null;
  },
  
  getCampaigns: async (filialeId?: string) => {
    console.log("Getting campaigns for filiale:", filialeId);
    
    // For demo purposes, return mock campaign data
    return [
      { id: 1, name: "Frühjahrsaktion 2025", description: "Vertragsverlängerungen für Q2 2025" },
      { id: 2, name: "Neukunden München", description: "Neukunden aus Messe März 2025" }
    ];
  }
};

// Mock filiale service for development
const mockFilialeService = {
  getFilialen: async () => {
    console.log("Getting filialen");
    
    // For demo purposes, return mock filiale data
    return [
      { id: "1", name: "Berlin", address: "Berliner Str. 123, 10115 Berlin" },
      { id: "2", name: "München", address: "Münchner Pl. 45, 80331 München" },
      { id: "3", name: "Hamburg", address: "Hamburger Allee 67, 20095 Hamburg" }
    ];
  }
};

// Export auth service
export const authService = mockAuthService;

// Export services that are used in other files
export const settingsService = mockSettingsService;
export const customerService = mockCustomerService;
export const filialeService = mockFilialeService;

// Export the API instance
export default api;
