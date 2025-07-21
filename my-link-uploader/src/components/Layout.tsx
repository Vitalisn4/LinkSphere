"use client"

import type { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { LinkIcon, LogIn, UserPlus, Bell } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import Sidebar from "./Sidebar"
import ProfileDropdown from "./ProfileDropdown"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="sticky top-0 z-50 backdrop-blur-md border-b bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
        <div className="w-full px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Left: Sidebar */}
          <div className="flex items-center flex-1">
            {user && <Sidebar />}
          </div>

          {/* Center: Logo */}
          <div className="flex-1 flex justify-center">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-105">
                <LinkIcon size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                LinkSphere
              </h1>
            </Link>
          </div>

          {/* Right: Search, Notifications, Profile */}
          <div className="flex items-center flex-1 justify-end space-x-4">
            {/* Search Bar */}
            <div className="hidden md:block">
              <input
                type="text"
                placeholder="Search links..."
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all w-56"
              />
            </div>
            {/* Notifications Bell */}
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell size={22} className="text-gray-500 dark:text-gray-300" />
            </button>
            {/* Profile Dropdown or Auth Links */}
            {user ? (
              <ProfileDropdown />
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                {location.pathname !== "/register" && (
                  <Link to="/register" className="flex items-center px-4 py-2 rounded-lg transition-colors text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50">
                    <UserPlus size={20} />
                    <span className="ml-2">Sign Up</span>
                  </Link>
                )}
                {location.pathname !== "/login" && (
                  <Link to="/login" className="flex items-center px-4 py-2 rounded-lg transition-colors text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50">
                    <LogIn size={20} />
                    <span className="ml-2">Login</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
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

      <footer className="w-full px-4 py-6 mt-auto border-t text-center text-sm text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800">
        <p>© {new Date().getFullYear()} LinkSphere. All rights reserved.</p>
      </footer>
    </div>
  )
}
