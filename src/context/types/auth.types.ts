
export type UserRole = 'admin' | 'filialleiter' | 'telefonist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  filiale?: string | null;
  avatar?: string | null;
}

export interface AuthContextType {
  user: User | null;
  token?: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsVerification?: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  verify2FA: (code: string) => Promise<void>;
  resetPassword: (email: string) => Promise<PasswordResetResponse | null>;
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<PasswordResetResponse | null>;
  updateUser?: (user: User) => void;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  data?: {
    reset_code?: string;
  };
}
