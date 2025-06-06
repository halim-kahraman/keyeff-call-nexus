
import api from './config';

export const appointmentService = {
  getAppointments: async () => {
    const response = await api.get('/backend/api/appointments/list.php');
    return response.data;
  },
  createAppointment: async (appointmentData: any) => {
    const response = await api.post('/backend/api/appointments/create.php', appointmentData);
    return response.data;
  }
};
