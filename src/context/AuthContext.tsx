import React, { createContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { authService } from "@/services/api";
import { User, AuthContextType, PasswordResetResponse, UserRole } from "./types/auth.types";

// Create context with undefined initial value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [isProcessingLogin, setIsProcessingLogin] = useState(false);

  // Add updateUser function that was missing
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    console.log('AuthProvider init - checking stored auth:', { 
      hasUser: !!storedUser, 
      hasToken: !!storedToken 
    });
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('AuthProvider - restoring user session:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Prevent multiple simultaneous login attempts
    if (isProcessingLogin) {
      console.log('Login already in progress, ignoring duplicate request');
      return;
    }
    
    setIsProcessingLogin(true);
    setIsLoading(true);
    
    try {
      console.log('Login attempt for:', email);
      const response = await authService.login(email, password);
      console.log('Login response:', response);
      
      if (response.success && response.data.needs_verification) {
        setNeedsVerification(true);
        setPendingUserId(response.data.user_id);
        
        toast.success("2FA-Code gesendet", {
          description: "Ein Bestätigungscode wurde an Ihre E-Mail-Adresse gesendet."
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.log('Error response status:', error.response?.status);
      console.log('Error response data:', error.response?.data);
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);
      
      // Handle different error scenarios - be more specific about error detection
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || error.message;
      
      if (status === 401) {
        console.log('401 error detected - showing invalid credentials toast');
        toast.error("Anmeldung fehlgeschlagen", {
          description: "Ungültige E-Mail-Adresse oder Passwort"
        });
      } else if (status === 500) {
        toast.error("Server-Fehler", {
          description: "Ein technischer Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
        });
      } else if (error.code === 'NETWORK_ERROR' || errorMessage?.includes('Network Error') || !status) {
        toast.error("Verbindungsfehler", {
          description: "Keine Verbindung zum Server. Bitte überprüfen Sie Ihre Internetverbindung."
        });
      } else {
        toast.error("Anmeldung fehlgeschlagen", {
          description: "Bitte überprüfen Sie Ihre Anmeldedaten und versuchen Sie es erneut."
        });
      }
    } finally {
      setIsLoading(false);
      setIsProcessingLogin(false);
    }
  };

  const verify2FA = async (code: string) => {
    if (!pendingUserId) {
      toast.error("Fehler", {
        description: "Keine Anmeldesitzung gefunden"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Verifying 2FA for user:', pendingUserId);
      const response = await authService.verify2FA(pendingUserId, code);
      console.log('2FA verification response:', response);
      
      if (response.success) {
        // Ensure the user data has the correct UserRole type
        const userData = {
          ...response.data.user,
          role: response.data.user.role as UserRole
        };
        
        console.log('2FA successful, setting user data:', userData);
        
        // Store user data in state and local storage
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          console.log('Token stored successfully');
        }
        
        setNeedsVerification(false);
        setPendingUserId(null);
        
        toast.success("Anmeldung erfolgreich", {
          description: `Willkommen zurück, ${userData.name}!`
        });
        
        // Force a redirect to dashboard after successful login
        console.log('Redirecting to dashboard after successful 2FA');
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error('2FA error:', error);
      console.log('2FA Error response status:', error.response?.status);
      console.log('2FA Error response data:', error.response?.data);
      
      // Handle different HTTP status codes for 2FA verification
      const status = error.response?.status;
      
      if (status === 401) {
        toast.error("Bestätigung fehlgeschlagen", {
          description: "Der eingegebene Code ist ungültig oder abgelaufen"
        });
      } else if (status === 404) {
        toast.error("Fehler", {
          description: "Benutzer nicht gefunden. Bitte melden Sie sich erneut an."
        });
      } else {
        toast.error("Bestätigung fehlgeschlagen", {
          description: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<PasswordResetResponse | null> => {
    setIsLoading(true);
    try {
      const response = await authService.requestPasswordReset(email);
      
      if (response.success) {
        toast.success("Zurücksetzen-Code gesendet", {
          description: "Falls die E-Mail in unserem System existiert, wurde ein Code gesendet."
        });
        
        return response;
      }
      return null;
    } catch (error) {
      console.error('Password reset request error:', error);
      toast.error("Anfrage fehlgeschlagen", {
        description: "Bitte versuchen Sie es später erneut"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmResetPassword = async (email: string, code: string, newPassword: string): Promise<PasswordResetResponse | null> => {
    setIsLoading(true);
    try {
      const response = await authService.resetPassword(email, code, newPassword);
      
      if (response.success) {
        toast.success("Passwort aktualisiert", {
          description: "Ihr Passwort wurde erfolgreich zurückgesetzt."
        });
        return response;
      }
      return null;
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      toast.error("Zurücksetzen fehlgeschlagen", {
        description: "Der eingegebene Code ist ungültig oder abgelaufen"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsLoading(false);
      toast.success("Abgemeldet", {
        description: "Sie wurden erfolgreich abgemeldet."
      });
      
      // Redirect to login after logout
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      login,
      logout,
      verify2FA,
      needsVerification,
      resetPassword,
      confirmResetPassword,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export types for compatibility
export type { User, UserRole, PasswordResetResponse } from "./types/auth.types";
