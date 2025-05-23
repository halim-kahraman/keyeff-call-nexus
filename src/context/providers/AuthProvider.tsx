
import React, { createContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { authService } from "@/services/api";
import { User, AuthContextType, PasswordResetResponse } from "../types/auth.types";

// Create context with undefined initial value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [loginAttemptCount, setLoginAttemptCount] = useState(0);
  const [isProcessingLogin, setIsProcessingLogin] = useState(false);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
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
    
    // Prevent duplicate login attempts
    setLoginAttemptCount(prev => prev + 1);
    const currentAttempt = loginAttemptCount + 1;
    
    setIsProcessingLogin(true);
    setIsLoading(true);
    
    try {
      console.log('Login attempt for:', email);
      const response = await authService.login(email, password);
      console.log('Login response:', response);
      
      // Only process if this is still the latest login attempt
      if (currentAttempt === loginAttemptCount) {
        if (response.success && response.data.needs_verification) {
          setNeedsVerification(true);
          setPendingUserId(response.data.user_id);
          
          // Show only one toast for successful OTP sending
          toast.success("2FA-Code gesendet", {
            description: "Ein Bestätigungscode wurde an Ihre E-Mail-Adresse gesendet."
          });
          
          // For demo purposes, show the OTP
          if (response.data.otp) {
            console.log('Demo OTP for login:', response.data.otp);
            toast.info(`Demo OTP: ${response.data.otp}`, {
              description: "Nur für Demozwecke!"
            });
          }
        }
      }
    } catch (error) {
      // Only show error if this is still the latest login attempt
      if (currentAttempt === loginAttemptCount) {
        console.error('Login error:', error);
        
        // Show only one toast for failed login
        toast.error("Anmeldung fehlgeschlagen", {
          description: "Bitte überprüfen Sie Ihre Anmeldedaten"
        });
      }
    } finally {
      // Only update loading state if this is still the latest login attempt
      if (currentAttempt === loginAttemptCount) {
        setIsLoading(false);
      }
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
      const response = await authService.verify2FA(pendingUserId, code);
      
      if (response.success) {
        setUser(response.data.user);
        setNeedsVerification(false);
        setPendingUserId(null);
        
        toast.success("Anmeldung erfolgreich", {
          description: `Willkommen zurück, ${response.data.user.name}!`
        });
      }
    } catch (error) {
      console.error('2FA error:', error);
      toast.error("Bestätigung fehlgeschlagen", {
        description: "Der eingegebene Code ist ungültig oder abgelaufen"
      });
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
        
        // For demo, return the code
        if (response.data?.reset_code) {
          console.log('Demo reset code:', response.data.reset_code);
          toast.info(`Demo Reset-Code: ${response.data.reset_code}`, {
            description: "Nur für Demozwecke!"
          });
        }
        
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
      setUser(null);
      setIsLoading(false);
      toast.success("Abgemeldet", {
        description: "Sie wurden erfolgreich abgemeldet."
      });
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
      confirmResetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
