
import api from './config';

export const templateService = {
  getTemplates: async (type?: string) => {
    try {
      const params = type ? `?type=${type}` : '';
      const response = await api.get(`/templates/list.php${params}`);
      console.log('Templates API response for type', type, ':', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },
  
  saveTemplate: async (templateData: any) => {
    try {
      const response = await api.post('/templates/save.php', templateData);
      return response.data;
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  },
  
  updateTemplate: async (templateId: string, templateData: any) => {
    try {
      const response = await api.put(`/templates/update.php?id=${templateId}`, templateData);
      return response.data;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },
  
  deleteTemplate: async (templateId: string) => {
    try {
      const response = await api.delete(`/templates/delete.php?id=${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }
};
