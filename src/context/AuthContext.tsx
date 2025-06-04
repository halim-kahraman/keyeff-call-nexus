
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { authService } from "@/services/api";
import { User, AuthContextType, PasswordResetResponse, UserRole } from "./types/auth.types";

// Create context with undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// useAuth hook - directly implemented here to avoid circular imports
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

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
      
      toast.error("Anmeldung fehlgeschlagen", {
        description: "Bitte überprüfen Sie Ihre Anmeldedaten"
      });
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
