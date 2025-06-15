import { createContext, useContext, useState, ReactNode } from 'react';
import ApiService, { User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, gender: string) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('token');
  });

  const login = async (email: string, password: string) => {
    const response = await ApiService.login(email, password);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
    setIsAuthenticated(true);
  };

  const register = async (email: string, username: string, password: string, gender: string) => {
    await ApiService.register(email, username, password, gender as any);
    // Store email for verification
    sessionStorage.setItem('pendingVerificationEmail', email);
  };

  const verifyEmail = async (email: string, otp: string) => {
    await ApiService.verifyEmail(email, otp);
    // Clear stored email after successful verification
    sessionStorage.removeItem('pendingVerificationEmail');
  };

  const resendOtp = async (email: string) => {
    await ApiService.resendOtp(email);
  };

  const logout = () => {
    ApiService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    setUser,
    setIsAuthenticated,
    login,
    register,
    verifyEmail,
    resendOtp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 