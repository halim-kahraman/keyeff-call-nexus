
import api from './config';

export const appointmentService = {
  getAppointments: async () => {
    const response = await api.get('/appointments/list.php');
    return response.data;
  },
  
  createAppointment: async (appointmentData: any) => {
    const response = await api.post('/appointments/create.php', appointmentData);
    return response.data;
  },
  
  updateAppointment: async (appointmentId: number, appointmentData: any) => {
    const response = await api.put(`/appointments/update.php?id=${appointmentId}`, appointmentData);
    return response.data;
  },
  
  deleteAppointment: async (appointmentId: number) => {
    const response = await api.delete(`/appointments/delete.php?id=${appointmentId}`);
    return response.data;
  }
};
