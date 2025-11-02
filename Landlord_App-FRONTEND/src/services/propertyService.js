import { api } from './api';

export const propertyService = {
  async getProperties() {
    const response = await api.get('/api/properties');
    return response.data;
  },

  async getProperty(id) {
    const response = await api.get(`/api/properties/${id}`);
    return response.data;
  },

  async createProperty(propertyData) {
    const response = await api.post('/api/properties', propertyData);
    return response.data;
  },

  async updateProperty(id, propertyData) {
    const response = await api.put(`/api/properties/${id}`, propertyData);
    return response.data;
  },

  async deleteProperty(id) {
    const response = await api.delete(`/api/properties/${id}`);
    return response.data;
  },
};

export default propertyService;

