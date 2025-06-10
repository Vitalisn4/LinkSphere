import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import ApiService, { Gender } from "../services/api";

interface User {
  id: string;
  email: string;
  username: string;
  gender: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, gender: Gender) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await ApiService.login(email, password);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (email: string, username: string, password: string, gender: Gender) => {
    try {
      await ApiService.register(email, username, password, gender);
      // Store email temporarily for verification
      sessionStorage.setItem("pendingVerificationEmail", email);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const verifyEmail = async (email: string, otp: string) => {
    try {
      await ApiService.verifyEmail(email, otp);
      // Clear stored email after verification
      sessionStorage.removeItem("pendingVerificationEmail");
    } catch (error) {
      console.error("Email verification failed:", error);
      throw error;
    }
  };

  const resendOtp = async (email: string) => {
    try {
      await ApiService.resendOtp(email);
    } catch (error) {
      console.error("OTP resend failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        verifyEmail,
        resendOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 