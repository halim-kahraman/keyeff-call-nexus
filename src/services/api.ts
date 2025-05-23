
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

// Export auth service
export const authService = mockAuthService;

// Export the API instance
export default api;
