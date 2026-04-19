import axios from 'axios';
import { TokenStorage } from './tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use((config) => {
  const token = TokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminApiService = {
  // Dashboard
  async getDashboardStats() {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },

  // Users
  async getUsers(page = 1, limit = 10) {
    const response = await apiClient.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  async createUser(userData: any) {
    const response = await apiClient.post('/admin/users', userData);
    return response.data;
  },

  async deleteUser(userId: string) {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  // Projects
  async getProjects(page = 1, limit = 10) {
    const response = await apiClient.get(`/admin/projects?page=${page}&limit=${limit}`);
    return response.data;
  },

  async createProject(projectData: any) {
    const response = await apiClient.post('/admin/projects', projectData);
    return response.data;
  },

  // Reports
  async getReports(page = 1, limit = 10) {
    const response = await apiClient.get(`/admin/reports?page=${page}&limit=${limit}`);
    return response.data;
  },

  async approveReport(reportId: string) {
    const response = await apiClient.post(`/admin/reports/${reportId}/approve`);
    return response.data;
  },

  async downloadReport(reportId: string) {
    const response = await apiClient.get(`/admin/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Vulnerabilities
  async getVulnerabilities(page = 1, limit = 10) {
    const response = await apiClient.get(`/admin/vulnerabilities?page=${page}&limit=${limit}`);
    return response.data;
  },

  async updateVulnerability(vulnId: string, data: any) {
    const response = await apiClient.put(`/admin/vulnerabilities/${vulnId}`, data);
    return response.data;
  },

  // Notifications
  async getNotifications(page = 1, limit = 10) {
    const response = await apiClient.get(`/admin/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  async sendNotification(notificationData: any) {
    const response = await apiClient.post('/admin/notifications', notificationData);
    return response.data;
  },

  async deleteNotification(notificationId: string) {
    await apiClient.delete(`/admin/notifications/${notificationId}`);
  },

  // Domain Analysis
  async getDomains() {
    const response = await apiClient.get('/admin/domains');
    return response.data;
  },

  async analyzeDomain(domain: string) {
    const response = await apiClient.post('/admin/domains/analyze', { domain });
    return response.data;
  },

  // Tasks
  async getTasks() {
    const response = await apiClient.get('/admin/tasks');
    return response.data;
  },

  async createTask(taskData: any) {
    const response = await apiClient.post('/admin/tasks', taskData);
    return response.data;
  },

  async updateTask(taskId: string, data: any) {
    const response = await apiClient.put(`/admin/tasks/${taskId}`, data);
    return response.data;
  },

  async deleteTask(taskId: string) {
    await apiClient.delete(`/admin/tasks/${taskId}`);
  },

  async updateTaskStatus(taskId: string, status: string) {
    const response = await apiClient.post(`/v1/tasks/${taskId}`, { status });
    return response.data;
  },

  async getPentesters() {
    const response = await apiClient.get('/v1/admin/users');
    return response.data;
  },

  async getOverviewStats() {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },

  async getRecentActivity() {
    const response = await apiClient.get('/admin/dashboard/activity');
    return response.data;
  }
};
