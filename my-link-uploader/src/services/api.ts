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

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const handleApiError = (error: unknown) => {
  if (error instanceof AxiosError && error.response) {
    const message = error.response.data.message || "An error occurred";
    if (error.response.status === 401 || error.response.status === 403) {
      // Clear invalid auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    throw new Error(message);
  }
  throw error;
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
      });
    } catch (error) {
      handleApiError(error);
    }
  },

  async verifyEmail(email: string, otp: string): Promise<void> {
    try {
      await axios.post<ApiResponse>(`${API_URL}/auth/verify`, {
        email,
        otp
      });
    } catch (error) {
      handleApiError(error);
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<ApiResponse<AuthResponse>>(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Login failed");
      }

      // Store auth data
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
      
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  async resendOtp(email: string): Promise<void> {
    try {
      await axios.post<ApiResponse>(`${API_URL}/auth/resend-otp`, { email });
    } catch (error) {
      handleApiError(error);
    }
  },

  async getAllLinks(): Promise<Link[]> {
    try {
      const response = await axios.get<ApiResponse<Link[]>>(`${API_URL}/links`, {
        headers: getAuthHeaders()
      });
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to fetch links");
      }
      
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async createLink(data: {
    url: string;
    title: string;
    description: string;
  }): Promise<Link> {
    try {
      // Validate user authentication
      const user = localStorage.getItem("user");
      if (!user) {
        throw new Error("User not authenticated. Please log in.");
      }

      const response = await axios.post<ApiResponse<Link>>(
        `${API_URL}/links`,
        data,
        { headers: getAuthHeaders() }
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to create link");
      }
      
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async deleteLink(id: string): Promise<void> {
    try {
      const response = await axios.delete<ApiResponse>(`${API_URL}/links/${id}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete link");
      }
    } catch (error) {
      handleApiError(error);
    }
  },

  async incrementLinkClick(id: string): Promise<void> {
    try {
      const response = await axios.post<ApiResponse>(
        `${API_URL}/links/${id}/click`,
        null,
        { headers: getAuthHeaders() }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to track click");
      }
    } catch (error) {
      handleApiError(error);
    }
  },
};

export default ApiService; 