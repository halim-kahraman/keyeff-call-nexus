
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/services/api";

export type UserRole = "admin" | "telefonist" | "filialleiter";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  filiale?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  verify2FA: (code: string) => Promise<void>;
  needsVerification: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      
      if (response.success && response.data.needs_verification) {
        setNeedsVerification(true);
        setPendingUserId(response.data.user_id);
        
        toast({
          title: "2FA-Code gesendet",
          description: "Ein Bestätigungscode wurde an Ihre E-Mail-Adresse gesendet."
        });
      }
    } catch (error) {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: "Bitte überprüfen Sie Ihre Anmeldedaten",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FA = async (code: string) => {
    if (!pendingUserId) {
      toast({
        title: "Fehler",
        description: "Keine Anmeldesitzung gefunden",
        variant: "destructive"
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
        
        toast({
          title: "Anmeldung erfolgreich",
          description: `Willkommen zurück, ${response.data.user.name}!`
        });
      }
    } catch (error) {
      toast({
        title: "Bestätigung fehlgeschlagen",
        description: "Der eingegebene Code ist ungültig oder abgelaufen",
        variant: "destructive"
      });
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
      toast({
        title: "Abgemeldet",
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
      needsVerification
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
