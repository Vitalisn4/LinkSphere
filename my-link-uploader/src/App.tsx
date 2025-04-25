"use client"

import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./contexts/ThemeContext"
import Layout from "./components/Layout"
import HomePage from "./components/HomePage"
import UploadForm from "./components/UploadForm"
import AdminDashboard from "./components/AdminDashboard"
import { AnimatePresence } from "framer-motion"

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Simulate authentication check
  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem("isAuthenticated")
      setIsAuthenticated(auth === "true")
    }

    checkAuth()

    // For demo purposes only - in a real app, use proper authentication
    window.addEventListener("storage", checkAuth)
    return () => window.removeEventListener("storage", checkAuth)
  }, [])

  // For demo purposes - toggle authentication
  const toggleAuth = () => {
    const newState = !isAuthenticated
    localStorage.setItem("isAuthenticated", String(newState))
    setIsAuthenticated(newState)
  }

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AnimatePresence mode="wait">
          <Layout toggleAuth={toggleAuth} isAuthenticated={isAuthenticated}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/upload" element={<UploadForm />} />
              <Route path="/admin" element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/" />} />
            </Routes>
          </Layout>
        </AnimatePresence>
      </ThemeProvider>
    </BrowserRouter>
  )
}
