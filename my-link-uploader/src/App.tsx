import * as React from 'react'
"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { useAuth } from "./hooks/useAuth"
import { ThemeProvider } from "./contexts/ThemeContext"
import Layout from "./components/Layout"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import VerifyEmailPage from "./pages/auth/VerifyEmailPage"
import UploadPage from "./pages/dashboard/UploadPage"
import DashboardPage from "./pages/dashboard/DashboardPage"
import MyAccountPage from "./pages/dashboard/MyAccountPage"

// Move route protection components inside the main App component
// so they have access to AuthContext
export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Layout>
            <AppRoutes />
          </Layout>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  function PrivateRoute({ children }: { children: React.ReactNode }) {
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
  }

  function PublicRoute({ children }: { children: React.ReactNode }) {
    return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/upload"
        element={
          <PrivateRoute>
            <UploadPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/my-account"
        element={
          <PrivateRoute>
            <MyAccountPage />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}
