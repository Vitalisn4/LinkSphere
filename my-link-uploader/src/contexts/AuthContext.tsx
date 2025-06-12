import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import ApiService, { Gender } from "../services/api";

interface User {
  id: string;
  email: string;
  username: string;
  gender: Gender;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, username: string, password: string, gender: string) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_CHECK_INTERVAL = 60000; // Check token every minute

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check token validity and auto-logout if expired
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        // Try to get user data to verify token
        await ApiService.getAllLinks();
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Token validation failed:", error);
        // If token is invalid, logout user
        handleLogout();
      }
    };

    // Initial check
    checkToken();

    // Set up periodic token checks
    const intervalId = setInterval(checkToken, TOKEN_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await ApiService.login(email, password);
      setUser(response.user);
      localStorage.setItem("token", response.token);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    }
  };

  const register = async (email: string, username: string, password: string, gender: string) => {
    try {
      await ApiService.register(email, username, password, gender);
    } catch (error) {
      throw error;
    }
  };

  const verifyEmail = async (email: string, otp: string) => {
    try {
      await ApiService.verifyEmail(email, otp);
    } catch (error) {
      throw error;
    }
  };

  const resendOtp = async (email: string) => {
    try {
      await ApiService.resendOtp(email);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout: handleLogout,
    register,
    verifyEmail,
    resendOtp,
  };

  return (
    <AuthContext.Provider value={value}>
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