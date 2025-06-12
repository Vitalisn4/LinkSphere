"use client"

import { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Upload,
  User,
  UserPlus,
  LogIn,
  Link as LinkIcon
} from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useTheme } from "../../hooks/useTheme"

// ... existing code ...

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

// ... existing code ...

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

// ... existing code ... 