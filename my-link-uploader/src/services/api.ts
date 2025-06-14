/// <reference types="vite/client" />
import axios, { AxiosError, AxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  timestamp?: string;
}

export type Gender = "Male" | "Female" | "Other";

export interface Link {
  id: string;
  url: string;
  title: string;
  description: string;
  user_id: string;
  click_count: number;
  created_at: string;
  updated_at: string;
  user: {
    username: string;
  };
  preview?: {
    title?: string;
    description?: string;
    favicon?: string;
    image?: string;
  };
}

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface ApiError {
  message: string;
  status: number;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const handleApiError = (error: AxiosError<ApiError>) => {
  if (error.response) {
    throw new Error(error.response.data.message || 'An error occurred');
  }
  throw new Error('Network error');
};

export const ApiService = {
  async register(email: string, username: string, password: string, gender: Gender): Promise<void> {
    try {
      await api.post<ApiResponse>('/auth/register', {
        email,
        username,
        password,
        gender
      });
    } catch (error) {
      handleApiError(error as AxiosError<ApiError>);
      throw error;
    }
  },

  async verifyEmail(email: string, otp: string): Promise<void> {
    try {
      await api.post<ApiResponse>('/auth/verify', {
        email,
        otp
      });
    } catch (error) {
      handleApiError(error as AxiosError<ApiError>);
      throw error;
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<ApiError>);
      throw error;
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  async resendOtp(email: string): Promise<void> {
    try {
      await api.post<ApiResponse>('/auth/resend-otp', { email });
    } catch (error) {
      handleApiError(error as AxiosError<ApiError>);
    }
  },

  async getLinks(): Promise<Link[]> {
    try {
      const response = await api.get<Link[]>('/links');
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<ApiError>);
      throw error;
    }
  },

  async createLink(data: Omit<Link, 'id' | 'created_at' | 'user_id'>): Promise<Link> {
    try {
      const response = await api.post<Link>('/links', data);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<ApiError>);
      throw error;
    }
  },

  async deleteLink(id: string): Promise<void> {
    try {
      await api.delete(`/links/${id}`);
    } catch (error) {
      handleApiError(error as AxiosError<ApiError>);
      throw error;
    }
  },

  async incrementLinkClick(id: string): Promise<void> {
    try {
      const response = await api.post<ApiResponse>(`/links/${id}/click`, null);
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to track click");
      }
    } catch (error) {
      handleApiError(error as AxiosError<ApiError>);
    }
  },
};

export default ApiService; 