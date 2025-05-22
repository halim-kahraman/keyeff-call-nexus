
// Auth Types definition
export type UserRole = "admin" | "telefonist" | "filialleiter";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  filiale?: string;
  avatar?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  data?: {
    reset_code?: string;
    email_success?: boolean;
    message?: string;
  };
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  verify2FA: (code: string) => Promise<void>;
  needsVerification: boolean;
  resetPassword: (email: string) => Promise<PasswordResetResponse | null>;
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<PasswordResetResponse | null>;
}
