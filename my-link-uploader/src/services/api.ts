/// <reference types="vite/client" />
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface ApiResponse<T = { redirect?: string }> {
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
  user?: {
    username: string;
  };
  preview?: {
    title?: string;
    description?: string;
    favicon?: string;
    image?: string;
  };
}

export interface User {
  id: string;
  email: string;
  username: string;
  gender: Gender;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

interface ApiError {
  message: string;
  error?: string;
  status: number;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  validateStatus: (status) => status < 500,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    return Promise.reject(error);
  }
);

const handleApiError = (error: AxiosError<ApiError>) => {
  if (error.response?.data) {
    const message =
      error.response.data.message ||
      error.response.data.error ||
      "Server error occurred";
    throw new Error(message);
  }
  if (error.request) {
    throw new Error("No response from server. Please check your connection.");
  }
  throw new Error(error.message || "An unexpected error occurred");
};

export const ApiService = {
  async register(
    email: string,
    username: string,
    password: string,
    gender: Gender
  ): Promise<void> {
    // Fire and forget - don't wait for response
    api
      .post("/auth/register", {
        email,
        username,
        password,
        gender,
      })
      .catch((error) => {
        console.error("Registration error:", error);
      });
  },

  async verifyEmail(email: string, otp: string): Promise<void> {
    try {
      const response = await api.post<ApiResponse>("/auth/verify", {
        email,
        otp,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Verification failed");
      }
    } catch (error) {
      handleApiError(error as AxiosError<ApiError>);
      throw error;
    }
  },

  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: User }> {
    try {
      const response = await api.post<
        ApiResponse<{ token: string; user: User }>
      >("/auth/login", {
        email,
        password,
      });

      if (!response.data.success || !response.data.data) {
        throw new Error("Invalid credentials");
      }

      return response.data.data;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Invalid credentials");
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  async resendOtp(email: string): Promise<void> {
    try {
      await api.post<ApiResponse>("/auth/resend-otp", { email });
    } catch (error) {
      handleApiError(error as AxiosError<ApiError>);
    }
  },

  async getAllLinks(): Promise<Link[]> {
    try {
      const response = await api.get<ApiResponse<Link[]>>("/links");

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to fetch links");
      }

      return response.data.data;
    } catch (error) {
      handleApiError(error as AxiosError<ApiError>);
      throw error;
    }
  },

  async createLink(data: {
    url: string;
    title: string;
    description: string;
  }): Promise<Link> {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await api.post<ApiResponse<Link>>("/links", {
        url: data.url,
        title: data.title,
        description: data.description,
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to create link");
      }

      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      if (axiosError.response?.status === 401) {
        throw new Error("Authentication required. Please log in again.");
      }
      if (axiosError.response?.status === 422) {
        throw new Error(
          axiosError.response.data.message || "Invalid link data"
        );
      }
      handleApiError(axiosError);
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

  async updateUsername(newUsername: string): Promise<User> {
    try {
      const response = await api.put<ApiResponse<User>>("/update-username", {
        username: newUsername,
      });
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to update username");
      }
      return response.data.data;
    } catch (error) {
      handleApiError(error as AxiosError<ApiError>);
      throw error;
    }
  },
};

export default ApiService;
