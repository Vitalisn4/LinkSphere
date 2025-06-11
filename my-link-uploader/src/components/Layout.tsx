"use client"

import type { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { useTheme } from "../hooks/useTheme"
import { motion } from "framer-motion"
import { 
  Sun, 
  Moon, 
  LinkIcon, 
  Upload, 
  LayoutDashboard, 
  LogOut, 
  LogIn, 
  UserPlus,
  Search,
  User
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const { user, logout } = useAuth()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${
        theme === "dark" 
          ? "bg-gray-800/80 border-gray-700" 
          : "bg-white/80 border-gray-200"
      }`}>
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-105">
              <LinkIcon size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                LinkSphere
              </h1>
              <p className={`text-base ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Link Management System
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <NavLink to="/dashboard" current={isActive("/dashboard")} theme={theme}>
                  <div className="flex items-center">
                    <LayoutDashboard size={20} />
                    <span className="ml-2">Dashboard</span>
                  </div>
                </NavLink>
                <NavLink to="/dashboard/upload" current={isActive("/dashboard/upload")} theme={theme}>
                  <div className="flex items-center">
                    <Upload size={20} />
                    <span className="ml-2">Upload</span>
                  </div>
                </NavLink>
                <NavLink to="/dashboard/search" current={isActive("/dashboard/search")} theme={theme}>
                  <div className="flex items-center">
                    <Search size={20} />
                    <span className="ml-2">Search</span>
                  </div>
                </NavLink>
                <NavLink to="/dashboard/my-account" current={isActive("/dashboard/my-account")} theme={theme}>
                  <div className="flex items-center">
                    <User size={20} />
                    <span className="ml-2">My Account</span>
                  </div>
                </NavLink>
              </>
            ) : (
              <NavLink to="/" current={isActive("/")} theme={theme}>
                Home
              </NavLink>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-lg transition-colors ${
                theme === "dark" 
                  ? "hover:bg-gray-700" 
                  : "hover:bg-gray-100"
              }`}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun size={24} className="text-yellow-300" />
              ) : (
                <Moon size={24} className="text-gray-600" />
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <span className={`text-base ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Welcome, {user.username}
                </span>
                <button
                  onClick={logout}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 text-base ${
                    theme === "dark"
                      ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      : "bg-red-100 text-red-600 hover:bg-red-200"
                  }`}
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {location.pathname !== "/register" && (
                  <Link
                    to="/register"
                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 text-base ${
                      theme === "dark"
                        ? "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                        : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                    }`}
                  >
                    <UserPlus size={20} />
                    <span className="ml-2">Sign Up</span>
                  </Link>
                )}
                {location.pathname !== "/login" && (
                  <Link
                    to="/login"
                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 text-base ${
                      theme === "dark"
                        ? "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                        : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                    }`}
                  >
                    <LogIn size={20} />
                    <span className="ml-2">Login</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="w-full px-4 py-8">
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

      <footer className={`w-full px-4 py-6 mt-auto border-t text-center text-sm ${
        theme === "dark"
          ? "border-gray-800 text-gray-400"
          : "border-gray-200 text-gray-600"
      }`}>
        <p>© {new Date().getFullYear()} LinkSphere. All rights reserved.</p>
      </footer>

      {/* Mobile Navigation */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-md border-t z-50 ${
        theme === "dark"
          ? "bg-gray-800/80 border-gray-700"
          : "bg-white/80 border-gray-200"
      }`}>
        <div className="flex justify-around py-3">
          {user ? (
            <>
              <MobileNavLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" theme={theme} />
              <MobileNavLink to="/dashboard/upload" icon={<Upload size={20} />} label="Upload" theme={theme} />
              <MobileNavLink to="/dashboard/search" icon={<Search size={20} />} label="Search" theme={theme} />
              <MobileNavLink to="/dashboard/my-account" icon={<User size={20} />} label="Account" theme={theme} />
            </>
          ) : (
            <>
              <MobileNavLink to="/" icon={<LinkIcon size={20} />} label="Home" theme={theme} />
              {location.pathname !== "/register" && (
                <MobileNavLink to="/register" icon={<UserPlus size={20} />} label="Sign Up" theme={theme} />
              )}
              {location.pathname !== "/login" && (
                <MobileNavLink to="/login" icon={<LogIn size={20} />} label="Login" theme={theme} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function NavLink({ to, current, children, theme }: { to: string; current: boolean; children: ReactNode; theme: string }) {
  return (
    <Link
      to={to}
      className={`relative px-5 py-2.5 rounded-lg text-base font-medium transition-all duration-300 ${
        current
          ? theme === "dark"
            ? "text-purple-400"
            : "text-purple-600"
          : theme === "dark"
          ? "text-gray-400 hover:text-purple-400 hover:bg-gray-800"
          : "text-gray-600 hover:text-purple-600 hover:bg-gray-100"
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

function MobileNavLink({ to, icon, label, theme }: { to: string; icon: ReactNode; label: string; theme: string }) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className={`flex flex-col items-center space-y-1 px-2 ${
        isActive
          ? theme === "dark"
            ? "text-purple-400"
            : "text-purple-600"
          : theme === "dark"
          ? "text-gray-400"
          : "text-gray-600"
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
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
