import axiosInstance from './axiosConfig';
import { TokenStorage } from './tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface UserProfile {
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
    last_login: string;
    created_at: string;
    updated_at: string;
  };
  profile: {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    specialization: string;
    experience_years: number;
    status: string;
    skills: string;
    certifications: string;
    resume_file_path: string;
    created_at: string;
    updated_at: string;
  };
}

export const profileApi = {
  async getProfile(): Promise<UserProfile> {
    const token = TokenStorage.getAccessToken();
    const response = await axiosInstance.get(`${API_BASE_URL}/v1/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },
};
