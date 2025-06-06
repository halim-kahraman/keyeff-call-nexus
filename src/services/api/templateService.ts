
import api from './config';

export const templateService = {
  getTemplates: async (type?: string) => {
    const params = type ? `?type=${type}` : '';
    const response = await api.get(`/templates/list.php${params}`);
    return response.data;
  },
  
  saveTemplate: async (templateData: any) => {
    const response = await api.post('/templates/save.php', templateData);
    return response.data;
  },
  
  updateTemplate: async (templateId: string, templateData: any) => {
    const response = await api.put(`/templates/update.php?id=${templateId}`, templateData);
    return response.data;
  },
  
  deleteTemplate: async (templateId: string) => {
    const response = await api.delete(`/templates/delete.php?id=${templateId}`);
    return response.data;
  }
};
