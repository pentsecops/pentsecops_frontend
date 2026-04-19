import axiosInstance from './axiosConfig';
import { TokenStorage } from './tokenStorage';
import { ChatMessage, Notification } from './websocketService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface MessageAttachment {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role: string;
}

export interface ChatConversation {
  user_id: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
}

export const messagingApi = {
  // Get all users for chat
  async getUsers(): Promise<User[]> {
    const token = TokenStorage.getAccessToken();
    const response = await axiosInstance.get(`${API_BASE_URL}/v1/messages/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },

  // Get chat history with a user
  async getChatHistory(userId: string, limit = 50, offset = 0): Promise<{ messages: ChatMessage[]; count: number }> {
    const token = TokenStorage.getAccessToken();
    const response = await axiosInstance.get(`${API_BASE_URL}/v1/messages/conversation/${userId}`, {
      params: { limit, offset },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Send message
  async sendMessage(receiverId: string, content: string, attachments?: File[]): Promise<ChatMessage> {
    const token = TokenStorage.getAccessToken();
    
    if (attachments && attachments.length > 0) {
      const formData = new FormData();
      formData.append('receiver_id', receiverId);
      formData.append('content', content);
      attachments.forEach(file => formData.append('attachments', file));
      
      const response = await axiosInstance.post(
        `${API_BASE_URL}/v1/messages/send`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      return response.data;
    }
    
    const response = await axiosInstance.post(
      `${API_BASE_URL}/v1/messages/send`,
      { receiver_id: receiverId, content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Mark message as read
  async markMessageAsRead(messageId: string): Promise<void> {
    const token = TokenStorage.getAccessToken();
    await axiosInstance.post(
      `${API_BASE_URL}/v1/messages/${messageId}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  // Delete message
  async deleteMessage(messageId: string): Promise<void> {
    const token = TokenStorage.getAccessToken();
    await axiosInstance.delete(`${API_BASE_URL}/v1/messages/${messageId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Get unread count
  async getUnreadCount(): Promise<{ unread_count: number; user_id: string }> {
    const token = TokenStorage.getAccessToken();
    const response = await axiosInstance.get(`${API_BASE_URL}/v1/messages/unread/count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get all conversations (for sidebar)
  async getConversations(): Promise<ChatConversation[]> {
    const token = TokenStorage.getAccessToken();
    const response = await axiosInstance.get(`${API_BASE_URL}/v1/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data || [];
  },

  // Get notifications
  async getNotifications(limit = 50, offset = 0): Promise<{ notifications: Notification[]; count: number; limit: number; offset: number }> {
    const token = TokenStorage.getAccessToken();
    const response = await axiosInstance.get(`${API_BASE_URL}/v1/notifications`, {
      params: { limit, offset },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Create notification
  async createNotification(data: {
    receiver_type: 'single' | 'multiple' | 'broadcast';
    receiver_ids?: string[];
    subject: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    in_app: boolean;
    email: boolean;
  }): Promise<void> {
    const token = TokenStorage.getAccessToken();
    await axiosInstance.post(
      `${API_BASE_URL}/v1/notifications`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    const token = TokenStorage.getAccessToken();
    await axiosInstance.put(
      `${API_BASE_URL}/v1/notifications/${notificationId}/read`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  // Download attachment
  async downloadAttachment(attachmentId: string): Promise<Blob> {
    const token = TokenStorage.getAccessToken();
    const response = await axiosInstance.get(`${API_BASE_URL}/v1/messages/attachments/${attachmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    });
    return response.data;
  },
};
