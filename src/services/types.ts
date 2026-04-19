export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'pentester' | 'stakeholder';
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}
