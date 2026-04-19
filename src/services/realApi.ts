import axios from 'axios';
import { LoginRequest, LoginResponse, ChangePasswordRequest } from './types';
import { TokenStorage } from './tokenStorage';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add response interceptor to handle 401 errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 if not on login page
    const isLoginPage = window.location.pathname === '/log-in';
    
    if (error.response?.status === 401 && !isLoginPage) {
      TokenStorage.clearTokens();
      localStorage.removeItem('user');
      toast.error('Session expired. Please login again.');
      setTimeout(() => {
        window.location.href = '/log-in';
      }, 1000);
    }
    return Promise.reject(error);
  }
);

export const realApiService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Determine endpoint based on email (admin uses different endpoint)
      const isAdmin = credentials.email.includes('admin');
      const endpoint = isAdmin ? '/v1/admin/login' : '/v1/login';
      
      const response = await apiClient.post(endpoint, credentials);
      
      // Transform API response to match our interface
      if (response.data.success) {
        // Handle different response formats (admin_id vs user_id)
        const userId = response.data.data.admin_id || response.data.data.user_id;
        const role = isAdmin ? 'admin' : (response.data.data.role || 'pentester');
        
        return {
          access_token: response.data.data.token,
          refresh_token: response.data.data.token,
          user_id: userId,
          email: response.data.data.email,
          full_name: response.data.data.email.split('@')[0],
          role: role
        };
      }
      
      // Handle success: false in response
      throw new Error(response.data.error || response.data.message || 'Login failed');
    } catch (error: any) {
      // Handle axios errors and API errors
      if (error.response?.data) {
        const errorData = error.response.data;
        throw new Error(errorData.error || errorData.message || 'Login failed');
      }
      throw error;
    }
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/v1/logout', { token: refreshToken });
  },

  async refreshToken(refreshToken: string): Promise<{ data: { access_token: string; refresh_token: string } }> {
    const response = await apiClient.post('/v1/refresh', { token: refreshToken });
    return {
      data: {
        access_token: response.data.data.token,
        refresh_token: response.data.data.token
      }
    };
  },

  async changePassword(data: ChangePasswordRequest, accessToken: string): Promise<void> {
    const payload = {
      current_password: data.current_password,
      new_password: data.new_password,
      confirm_password: data.new_password
    };
    await apiClient.post('/v1/change-password', payload, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  }
};
