
import api from './config';

export const userService = {
  getUsers: async () => {
    const response = await api.get('/users/list.php');
    return response.data;
  },
  createUser: async (userData: any) => {
    const response = await api.post('/users/create.php', userData);
    return response.data;
  },
  updateUser: async (userId: string, userData: any) => {
    const response = await api.put(`/users/update.php?id=${userId}`, userData);
    return response.data;
  },
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/users/delete.php?id=${userId}`);
    return response.data;
  }
};
