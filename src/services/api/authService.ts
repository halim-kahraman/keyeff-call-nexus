
import api from './config';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login.php', { email, password });
    return response.data;
  },
  verify2FA: async (userId: string, otp: string) => {
    const response = await api.post('/auth/verify.php', { user_id: userId, otp });
    return response.data;
  },
  requestPasswordReset: async (email: string) => {
    const response = await api.post('/auth/reset-password.php', { email });
    return response.data;
  },
  resetPassword: async (email: string, reset_code: string, new_password: string) => {
    const response = await api.post('/auth/reset-password.php', { 
      email, 
      reset_code, 
      new_password 
    });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout.php');
    return response.data;
  }
};
