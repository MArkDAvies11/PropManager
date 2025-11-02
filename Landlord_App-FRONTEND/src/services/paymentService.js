import { api } from './api';

export const paymentService = {
  async getPayments() {
    const response = await api.get('/api/payments');
    return response.data;
  },

  async getPayment(id) {
    const response = await api.get(`/api/payments/${id}`);
    return response.data;
  },

  async createPayment(paymentData) {
    const response = await api.post('/api/payments', paymentData);
    return response.data;
  },

  async updatePayment(id, paymentData) {
    const response = await api.put(`/api/payments/${id}`, paymentData);
    return response.data;
  },

  async deletePayment(id) {
    const response = await api.delete(`/api/payments/${id}`);
    return response.data;
  },
};