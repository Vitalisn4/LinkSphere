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
}

export default ApiService; 