
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
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser?: (user: User) => void;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}
