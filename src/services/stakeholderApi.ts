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

export const stakeholderApiService = {
  // Dashboard
  async getDashboardStats() {
    const response = await apiClient.get('/stakeholder/dashboard/stats');
    return response.data;
  },

  // Reports
  async getReports() {
    const response = await apiClient.get('/stakeholder/reports');
    return response.data;
  },

  async downloadReport(reportId: string) {
    const response = await apiClient.get(`/stakeholder/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Vulnerabilities
  async getVulnerabilities() {
    const response = await apiClient.get('/stakeholder/vulnerabilities');
    return response.data;
  }
};
