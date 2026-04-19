import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../App';
import { apiService, type LoginRequest } from '../services/api';
import { TokenStorage } from '../services/tokenStorage';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing tokens and user data on app load
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      
      if (TokenStorage.hasTokens() && storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        TokenStorage.clearTokens();
        localStorage.removeItem('user');
      }
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await apiService.login(credentials);
      
      // Store tokens
      TokenStorage.setTokens(response.access_token, response.refresh_token);
      
      // Map API user to app user format
      const user: User = {
        id: response.user_id,
        name: response.full_name,
        email: response.email,
        role: response.role
      };
      
      // Store user data in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (error) {
      TokenStorage.clearTokens();
      throw error;
    }
  };

  const logout = async () => {
    TokenStorage.clearTokens();
    localStorage.removeItem('user');
    setUser(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const accessToken = TokenStorage.getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    await apiService.changePassword(
      { current_password: currentPassword, new_password: newPassword },
      accessToken
    );
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}