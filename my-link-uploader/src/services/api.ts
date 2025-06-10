const API_URL = "http://localhost:8080/api";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  timestamp?: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    gender: string;
  };
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

class ApiService {
  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    const data: ApiResponse<T> = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data.data as T;
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    return this.handleResponse<AuthResponse>(response);
  }

  static async register(
    email: string, 
    username: string, 
    password: string,
    gender: Gender
  ): Promise<void> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, username, password, gender }),
    });

    return this.handleResponse(response);
  }

  static async verifyEmail(email: string, otp: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, otp }),
    });

    return this.handleResponse(response);
  }

  static async resendOtp(email: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/resend-otp`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
    });

    return this.handleResponse(response);
  }

  static async getAllLinks(): Promise<Link[]> {
    const response = await fetch(`${API_URL}/links`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<Link[]>(response);
  }

  static async createLink(data: {
    url: string;
    title: string;
    description: string;
  }): Promise<Link> {
    const response = await fetch(`${API_URL}/links`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<Link>(response);
  }

  static async deleteLink(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/links/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  static async incrementLinkClick(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/links/${id}/click`, {
      method: "POST",
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }
}

export default ApiService; 