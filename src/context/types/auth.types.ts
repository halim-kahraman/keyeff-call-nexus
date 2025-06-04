
export type UserRole = 'admin' | 'filialleiter' | 'mitarbeiter' | 'telefonist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  filiale?: string | null;
  filiale_id?: number | null;
  avatar?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsVerification: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verify2FA: (code: string) => Promise<void>;
  resetPassword: (email: string) => Promise<PasswordResetResponse | null>;
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<PasswordResetResponse | null>;
  updateUser?: (user: User) => void;
}
