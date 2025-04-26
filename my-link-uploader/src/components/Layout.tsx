"use client"

import type { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { useTheme } from "../hooks/useTheme"
import { motion } from "framer-motion"
import { Sun, Moon, LinkIcon, Upload, LayoutDashboard, LogOut, LogIn } from "lucide-react"

interface LayoutProps {
  children: ReactNode
  toggleAuth: () => void
  isAuthenticated: boolean
}

export default function Layout({ children, toggleAuth, isAuthenticated }: LayoutProps) {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-900"
      }`}
    >
      <header className="sticky top-0 z-50 backdrop-blur-md bg-opacity-70 border-b border-purple-500/20 dark:border-purple-500/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <img 
              src="/logo.png" 
              alt="LinkSphere Logo" 
              className="h-10 w-auto group-hover:scale-105 transition-transform duration-300"
            />
            <div>
              <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                LinkSphere
              </h1>
              <p className="text-xs opacity-70">Link Management System</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/" current={location.pathname === "/"}>
              Home
            </NavLink>
            <NavLink to="/upload" current={location.pathname === "/upload"}>
              Upload
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/admin" current={location.pathname === "/admin"}>
                Dashboard
              </NavLink>
            )}
          </nav>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-purple-500/10 transition-colors"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun size={20} className="text-yellow-300" />
              ) : (
                <Moon size={20} className="text-purple-600" />
              )}
            </button>

            <button
              onClick={toggleAuth}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                isAuthenticated
                  ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                  : "bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20"
              }`}
            >
              {isAuthenticated ? (
                <>
                  <LogOut size={16} />
                  <span className="text-sm">Logout</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span className="text-sm">Login</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="container mx-auto px-4 py-6 mt-auto border-t border-purple-500/10 text-center text-sm opacity-70">
        <p>© {new Date().getFullYear()} LinkSphere. All rights reserved.</p>
      </footer>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-purple-500/20 z-50">
        <div className="flex justify-around py-3">
          <MobileNavLink to="/" icon={<LinkIcon size={20} />} label="Home" />
          <MobileNavLink to="/upload" icon={<Upload size={20} />} label="Upload" />
          {isAuthenticated && <MobileNavLink to="/admin" icon={<LayoutDashboard size={20} />} label="Admin" />}
        </div>
      </div>
    </div>
  )
}

function NavLink({ to, current, children }: { to: string; current: boolean; children: ReactNode }) {
  return (
    <Link
      to={to}
      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
        current
          ? "text-purple-600 dark:text-purple-400"
          : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-500/10"
      }`}
    >
      {children}
      {current && (
        <motion.div
          layoutId="activeNavIndicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-500"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  )
}

function MobileNavLink({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className={`flex flex-col items-center space-y-1 px-2 ${
        isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-400"
      }`}
    >
      {icon}
      <span className="text-xs">{label}</span>
      {isActive && (
        <motion.div
          layoutId="activeMobileNavIndicator"
          className="absolute -top-1 h-0.5 w-12 bg-gradient-to-r from-purple-600 to-pink-500"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  )
}
