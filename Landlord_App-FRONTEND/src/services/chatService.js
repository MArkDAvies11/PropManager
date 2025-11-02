import { api } from './api';

export const chatService = {
  async getConversations() {
    const response = await api.get('/api/conversations');
    return response.data;
  },

  async getConversation(id) {
    const response = await api.get(`/api/conversations/${id}`);
    return response.data;
  },

  async createConversation(conversationData) {
    const response = await api.post('/api/conversations', conversationData);
    return response.data;
  },

  async getMessages(conversationId) {
    const response = await api.get(`/api/conversations/${conversationId}/messages`);
    return response.data;
  },

  async sendMessage(conversationId, messageData) {
    const response = await api.post(`/api/conversations/${conversationId}/messages`, messageData);
    return response.data;
  },

  async markAsRead(conversationId) {
    const response = await api.put(`/api/conversations/${conversationId}/read`);
    return response.data;
  },
};