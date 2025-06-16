import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService, { User } from '../services/api';
import { AuthContext } from './context';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string) => {
    const response = await ApiService.login(email, password);
    setUser(response.data.user);
    setIsAuthenticated(true);
    localStorage.setItem('token', response.data.token);
    navigate('/dashboard');
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const register = async (email: string, username: string, password: string, gender: string) => {
    await ApiService.register({ email, username, password, gender });
    navigate('/verify-email', { state: { email } });
  };

  const verifyEmail = async (email: string, otp: string) => {
    await ApiService.verifyEmail(email, otp);
    navigate('/login');
  };

  const resendOtp = async (email: string) => {
    await ApiService.resendOtp(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        login,
        logout,
        register,
        verifyEmail,
        resendOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 