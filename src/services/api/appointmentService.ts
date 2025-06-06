
import api from './config';

export const appointmentService = {
  getAppointments: async () => {
    const response = await api.get('/appointments/list.php');
    return response.data;
  },
  createAppointment: async (appointmentData: any) => {
    const response = await api.post('/appointments/create.php', appointmentData);
    return response.data;
  }
};
