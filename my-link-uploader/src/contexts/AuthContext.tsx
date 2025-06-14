import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import { AuthContext, AuthContextType } from './auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    setUser(null);
        setIsAuthenticated(false);
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      handleLogout();
    }
    setIsLoading(false);
  }, [handleLogout]);

  const login = async (email: string, password: string) => {
      const response = await ApiService.login(email, password);
    const { token, user } = response;
    setUser(user);
    localStorage.setItem('token', token);
      setIsAuthenticated(true);
  };

  const register = async (email: string, username: string, password: string) => {
    await ApiService.register(email, username, password);
  };

  const verifyEmail = async (email: string, otp: string) => {
      await ApiService.verifyEmail(email, otp);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    verifyEmail,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 