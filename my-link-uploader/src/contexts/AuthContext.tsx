import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService, { User } from '../services/api';
import { AuthContext } from './context';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  useEffect(() => {
    // Initialize auth state from localStorage
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await ApiService.login(email, password);
    setUser(response.data.user);
    setIsAuthenticated(true);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    navigate('/dashboard');
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
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