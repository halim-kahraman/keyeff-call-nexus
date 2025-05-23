
import axios from "axios";

// Base API configuration
const api = axios.create({
  baseURL: "/backend/api",
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Auth service
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login.php", { email, password });
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  
  verify: async () => {
    try {
      const response = await api.get("/auth/verify.php");
      return response.data;
    } catch (error) {
      console.error("Verification error:", error);
      throw error;
    }
  },

  verify2FA: async (userId: string, code: string) => {
    try {
      const response = await api.post("/auth/verify-2fa.php", { user_id: userId, code });
      return response.data;
    } catch (error) {
      console.error("2FA verification error:", error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const response = await api.post("/auth/logout.php");
      return response.data;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },
  
  requestPasswordReset: async (email: string) => {
    try {
      const response = await api.post("/auth/request-reset.php", { email });
      return response.data;
    } catch (error) {
      console.error("Password reset request error:", error);
      throw error;
    }
  },
  
  resetPassword: async (email: string, code: string, newPassword: string) => {
    try {
      const response = await api.post("/auth/reset-password.php", { 
        email, 
        code, 
        new_password: newPassword 
      });
      return response.data;
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  }
};

// Customer service
export const customerService = {
  getCustomers: async (filiale_id: string, campaign_id?: string) => {
    console.info("Getting customers for filiale:", filiale_id, "campaign:", campaign_id);
    
    try {
      const params = { filiale_id };
      if (campaign_id && campaign_id !== "all") {
        Object.assign(params, { campaign_id });
      }
      
      const response = await api.get("/customers/list.php", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },
  
  getCustomerDetails: async (id: string) => {
    try {
      const response = await api.get(`/customers/detail.php`, { params: { id } });
      return response.data;
    } catch (error) {
      console.error("Error fetching customer details:", error);
      throw error;
    }
  },
  
  getCustomerById: async (id: string) => {
    return customerService.getCustomerDetails(id);
  },
  
  importCustomers: async (file: File, filiale_id: string, campaign_id: string) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filiale_id", filiale_id);
      formData.append("campaign_id", campaign_id);
      
      const response = await api.post("/customers/import.php", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    } catch (error) {
      console.error("Error importing customers:", error);
      throw error;
    }
  }
};

// Campaign service
export const campaignService = {
  getCampaigns: async (filiale_id: string) => {
    console.info("Getting campaigns for filiale:", filiale_id);
    
    try {
      const response = await api.get("/campaigns/list.php", { params: { filiale_id } });
      return response.data;
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      throw error;
    }
  }
};

// Filiale service
export const filialeService = {
  getFilialen: async () => {
    console.info("Getting filialen");
    
    try {
      const response = await api.get("/filialen/list.php");
      return response.data;
    } catch (error) {
      console.error("Error fetching filialen:", error);
      throw error;
    }
  }
};

// Call log service
export const callLogService = {
  logCall: async (data: any) => {
    try {
      const response = await api.post("/calls/log.php", data);
      return response.data;
    } catch (error) {
      console.error("Error logging call:", error);
      throw error;
    }
  }
};

// Appointment service
export const appointmentService = {
  createAppointment: async (data: any) => {
    try {
      const response = await api.post("/appointments/create.php", data);
      return response.data;
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },
  
  getAppointments: async (params: any) => {
    try {
      const response = await api.get("/appointments/list.php", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  }
};

// Settings service
export const settingsService = {
  getSettings: async (category: string, filiale_id?: string) => {
    console.info("Getting settings for:", category, "filiale:", filiale_id);
    
    try {
      const params = { category };
      if (filiale_id) {
        Object.assign(params, { filiale_id });
      }
      
      const response = await api.get("/settings/get.php", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching settings:", error);
      throw error;
    }
  },
  
  saveSettings: async (category: string, settings: any, filiale_id?: string) => {
    try {
      const data = { 
        category, 
        settings,
        filiale_id
      };
      
      const response = await api.post("/settings/save.php", data);
      return response.data;
    } catch (error) {
      console.error("Error saving settings:", error);
      throw error;
    }
  },
  
  testSipConnection: async (settings: any) => {
    try {
      const response = await api.post("/settings/test-sip.php", { settings });
      return response.data;
    } catch (error) {
      console.error("Error testing SIP connection:", error);
      throw error;
    }
  },
  
  testVpnConnection: async (settings: any) => {
    try {
      const response = await api.post("/settings/test-vpn.php", { settings });
      return response.data;
    } catch (error) {
      console.error("Error testing VPN connection:", error);
      throw error;
    }
  },
  
  testFritzboxConnection: async (settings: any) => {
    try {
      const response = await api.post("/settings/test-fritzbox.php", { settings });
      return response.data;
    } catch (error) {
      console.error("Error testing FRITZ!Box connection:", error);
      throw error;
    }
  },
  
  testEmailConnection: async (settings: any) => {
    try {
      const response = await api.post("/settings/test-email.php", { settings });
      return response.data;
    } catch (error) {
      console.error("Error testing Email connection:", error);
      throw error;
    }
  },
  
  testKeyEffApiConnection: async (settings: any) => {
    try {
      const response = await api.post("/settings/test-keyeff-api.php", { settings });
      return response.data;
    } catch (error) {
      console.error("Error testing KeyEff API connection:", error);
      throw error;
    }
  }
};

// Statistics service
export const statisticsService = {
  getStatistics: async (startDate: string, endDate: string, userId?: string) => {
    console.info("Getting statistics for date range:", startDate, endDate, "user:", userId);
    
    try {
      // For testing purposes, create mock data that makes sense
      // In a real app, this would be a call to the backend API
      // return await api.get("/statistics/get.php", { params: { start_date: startDate, end_date: endDate, user_id: userId } });
      
      // Create consistent mock data for all users
      const mockUsers = [
        { id: "1", name: "Laura Fischer", filiale: "1" },
        { id: "2", name: "Markus Schmidt", filiale: "1" },
        { id: "3", name: "Anna Müller", filiale: "2" },
        { id: "4", name: "Thomas Weber", filiale: "2" },
        { id: "5", name: "Sarah Becker", filiale: "3" }
      ];
      
      // Base call data per user
      const userStats = {
        "1": { calls: 85, appointments: 23, customers: 72, avgDuration: 186 },
        "2": { calls: 64, appointments: 17, customers: 55, avgDuration: 205 },
        "3": { calls: 92, appointments: 28, customers: 80, avgDuration: 167 },
        "4": { calls: 77, appointments: 22, customers: 62, avgDuration: 194 },
        "5": { calls: 103, appointments: 31, customers: 87, avgDuration: 176 }
      };
      
      // Filiale data
      const filialeStats = [
        { 
          id: "1", 
          name: "Berlin", 
          total_users: 18, 
          total_calls: 149, 
          total_appointments: 40, 
          total_call_duration: 27945, 
          avg_call_duration: 187 
        },
        { 
          id: "2", 
          name: "Hamburg", 
          total_users: 14, 
          total_calls: 169, 
          total_appointments: 50, 
          total_call_duration: 30589, 
          avg_call_duration: 181 
        },
        { 
          id: "3", 
          name: "München", 
          total_users: 12, 
          total_calls: 103, 
          total_appointments: 31, 
          total_call_duration: 18128, 
          avg_call_duration: 176 
        }
      ];
      
      // Call outcomes distribution
      const outcomePercentages = {
        "interested": 38,
        "not_interested": 25,
        "callback": 13,
        "appointment": 11,
        "no_answer": 13
      };
      
      // Generate calls by day (last 7 days)
      const days = 7;
      const calls_by_day = [];
      let totalCalls = 0;
      let totalDuration = 0;
      
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        const callCount = userId ? 
          Math.floor(userStats[userId as keyof typeof userStats]?.calls / days) + Math.floor(Math.random() * 5) : 
          Math.floor(Math.random() * 10) + 15;
          
        const avgDur = userId ? 
          userStats[userId as keyof typeof userStats]?.avgDuration : 
          180 + Math.floor(Math.random() * 60);
          
        totalCalls += callCount;
        totalDuration += callCount * avgDur;
        
        calls_by_day.push({
          day: date.toISOString().split('T')[0],
          total_calls: callCount,
          total_duration: callCount * avgDur,
          avg_duration: avgDur
        });
      }
      
      // Generate calls by outcome
      const calls_by_outcome = [];
      for (const [outcome, percentage] of Object.entries(outcomePercentages)) {
        const count = Math.round(totalCalls * (percentage/100));
        calls_by_outcome.push({
          outcome,
          count
        });
      }
      
      // Generate top callers
      const top_callers = mockUsers.map(user => {
        const stats = userStats[user.id as keyof typeof userStats];
        return {
          id: user.id,
          name: user.name,
          total_calls: stats.calls,
          total_duration: stats.calls * stats.avgDuration,
          avg_duration: stats.avgDuration
        };
      });
      
      // Filter by user if specified
      if (userId) {
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          const stats = userStats[userId as keyof typeof userStats];
          const selectedUser = mockUsers[userIndex];
          
          return {
            success: true,
            message: "Statistics retrieved successfully",
            data: {
              summary: {
                total_calls: stats.calls,
                total_appointments: stats.appointments,
                total_customers_contacted: stats.customers,
                period: { start: startDate, end: endDate }
              },
              calls_by_day,
              calls_by_outcome,
              top_callers: [top_callers[userIndex]],
              appointments_by_type: [
                { type: "Beratung", count: Math.floor(stats.appointments * 0.6) },
                { type: "Probefahrt", count: Math.floor(stats.appointments * 0.3) },
                { type: "Kaufabschluss", count: Math.floor(stats.appointments * 0.1) }
              ],
              filiale_stats: filialeStats.filter(f => f.id === selectedUser.filiale)
            }
          };
        }
      }
      
      // Return all statistics if no user is specified
      return {
        success: true,
        message: "Statistics retrieved successfully",
        data: {
          summary: {
            total_calls: top_callers.reduce((sum, caller) => sum + caller.total_calls, 0),
            total_appointments: Math.floor(totalCalls * 0.25),
            total_customers_contacted: Math.floor(totalCalls * 0.85),
            period: { start: startDate, end: endDate }
          },
          calls_by_day,
          calls_by_outcome,
          top_callers,
          appointments_by_type: [
            { type: "Beratung", count: 46 },
            { type: "Probefahrt", count: 27 },
            { type: "Kaufabschluss", count: 8 }
          ],
          filiale_stats: filialeStats
        }
      };
      
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw error;
    }
  }
};
