"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useTheme } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"

export default function MyAccountPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log(formData)
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={`text-4xl font-bold mb-8 ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}>
          My Account
        </h1>

        <div className={`p-6 rounded-xl shadow-lg mb-8 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <h2 className={`text-2xl font-semibold mb-6 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            Profile Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                required
              />
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className={`text-lg font-medium mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                Change Password
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className={`block text-sm font-medium mb-2 ${
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className={`block text-sm font-medium mb-2 ${
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className={`block text-sm font-medium mb-2 ${
                      theme === "dark" ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200 ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-white hover:bg-gray-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
} 