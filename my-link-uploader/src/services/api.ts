/// <reference types="vite/client" />
import axios, { AxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  timestamp?: string;
}

export type Gender = "male" | "female" | "other";

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
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    gender: Gender;
  };
}

const ApiService = {
  async register(email: string, username: string, password: string, gender: Gender): Promise<void> {
    try {
      await axios.post<ApiResponse>(`${API_URL}/auth/register`, {
        email,
        username,
        password,
        gender
      }, {
        headers: getAuthHeaders()
      });
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        throw new Error(err.response.data.message || "Registration failed");
      }
      throw err;
    }
  },

  async verifyEmail(email: string, otp: string): Promise<void> {
    try {
      await axios.post<ApiResponse>(`${API_URL}/auth/verify`, {
        email,
        otp
      }, {
        headers: getAuthHeaders()
      });
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        throw new Error(err.response.data.message || "Email verification failed");
      }
      throw err;
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<ApiResponse<AuthResponse>>(`${API_URL}/auth/login`, {
        email,
        password
      }, {
        headers: getAuthHeaders()
      });
      return response.data.data!;
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        throw new Error(err.response.data.message || "Login failed");
      }
      throw err;
    }
  },

  async resendOtp(email: string): Promise<void> {
    try {
      await axios.post<ApiResponse>(`${API_URL}/auth/resend-otp`, { email }, {
        headers: getAuthHeaders()
      });
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        throw new Error(err.response.data.message || "Failed to resend verification code");
      }
      throw err;
    }
  },

  async getAllLinks(): Promise<Link[]> {
    try {
      const response = await axios.get<ApiResponse<Link[]>>(`${API_URL}/links`, {
        headers: getAuthHeaders()
      });
      return response.data.data!;
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        throw new Error(err.response.data.message || "Failed to fetch links");
      }
      throw err;
    }
  },

  async createLink(data: {
    url: string;
    title: string;
    description: string;
  }): Promise<Link> {
    try {
      const response = await axios.post<ApiResponse<Link>>(`${API_URL}/links`, data, {
        headers: getAuthHeaders()
      });
      return response.data.data!;
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        throw new Error(err.response.data.message || "Failed to create link");
      }
      throw err;
    }
  },

  async deleteLink(id: string): Promise<void> {
    try {
      await axios.delete<ApiResponse>(`${API_URL}/links/${id}`, {
        headers: getAuthHeaders()
      });
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        throw new Error(err.response.data.message || "Failed to delete link");
      }
      throw err;
    }
  },

  async incrementLinkClick(id: string): Promise<void> {
    try {
      await axios.post<ApiResponse>(`${API_URL}/links/${id}/click`, null, {
        headers: getAuthHeaders()
      });
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        throw new Error(err.response.data.message || "Failed to track click");
      }
      throw err;
    }
  },
};

export default ApiService; 