"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useTheme } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"
import { Link, LogOut, Settings, User, Trash2, Link as LinkIcon } from "lucide-react"

type Tab = "my-links" | "settings" | "edit-profile"

export default function MyAccountPage() {
  const { theme } = useTheme()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>("my-links")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion
    setShowDeleteConfirm(false)
    await logout()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement profile update
    console.log(formData)
  }

  const renderContent = () => {
    switch (activeTab) {
      case "my-links":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-6">My Links</h2>
            {/* TODO: Implement links list */}
            <p className="text-gray-500">Your uploaded links will appear here</p>
          </div>
        )
      case "settings":
  return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Settings</h2>
            <div className="p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50 dark:bg-red-900/20">
              <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        )
      case "edit-profile":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Edit Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500"
              />
            </div>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg"
              >
                Save Changes
              </button>
            </form>
          </div>
        )
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className={`w-64 border-r ${
        theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}>
        <div className="p-4">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab("my-links")}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "my-links"
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
            >
              <LinkIcon size={20} />
              <span>My Links</span>
            </button>
            <button
              onClick={() => setActiveTab("edit-profile")}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "edit-profile"
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
              <User size={20} />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "settings"
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
                </div>
              </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
            </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Delete Account</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 