
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

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

// Mock users for demo purposes
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@keyeff.de',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  },
  {
    id: '2',
    name: 'Max Müller',
    email: 'telefonist@keyeff.de',
    role: 'telefonist',
    filiale: 'Berlin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=telefonist',
  },
  {
    id: '3',
    name: 'Sarah Schmidt',
    email: 'filialleiter@keyeff.de',
    role: 'filialleiter',
    filiale: 'München',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=filialleiter',
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const foundUser = mockUsers.find(u => u.email === email);
      
      if (!foundUser || password !== "password") {
        throw new Error("Ungültige Anmeldedaten");
      }

      // In a real app, we would not store the user in localStorage without proper security
      // This is just for demo purposes
      setNeedsVerification(true);
      
      toast({
        title: "2FA-Code gesendet",
        description: "Ein Bestätigungscode wurde an Ihre E-Mail-Adresse gesendet."
      });
      
      // Store user temporarily until 2FA verification
      sessionStorage.setItem('pendingUser', JSON.stringify(foundUser));
    } catch (error) {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: error instanceof Error ? error.message : "Bitte überprüfen Sie Ihre Anmeldedaten",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FA = async (code: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, any code will work
      if (code.length !== 6) {
        throw new Error("Ungültiger Code");
      }

      // Get stored pending user
      const pendingUserStr = sessionStorage.getItem('pendingUser');
      if (!pendingUserStr) {
        throw new Error("Keine Anmeldesitzung gefunden");
      }

      const pendingUser = JSON.parse(pendingUserStr);
      setUser(pendingUser);
      localStorage.setItem('user', JSON.stringify(pendingUser));
      sessionStorage.removeItem('pendingUser');
      setNeedsVerification(false);

      toast({
        title: "Anmeldung erfolgreich",
        description: `Willkommen zurück, ${pendingUser.name}!`
      });
    } catch (error) {
      toast({
        title: "Bestätigung fehlgeschlagen",
        description: error instanceof Error ? error.message : "Bitte versuchen Sie es erneut",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    toast({
      title: "Abgemeldet",
      description: "Sie wurden erfolgreich abgemeldet."
    });
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
