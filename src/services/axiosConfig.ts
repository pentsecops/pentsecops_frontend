import axios from 'axios';
import { TokenStorage } from './tokenStorage';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add response interceptor to handle 401 errors globally
axiosInstance.interceptors.response.use(
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

export default axiosInstance;
