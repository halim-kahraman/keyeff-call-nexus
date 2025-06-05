
import api from './config';

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications/list.php');
    return response.data;
  },

  markAsRead: async (notificationId: number) => {
    const response = await api.post('/notifications/mark-read.php', { id: notificationId });
    return response.data;
  }
};
