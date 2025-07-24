import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  if (!user) return null;

  const userInitial = user.username ? user.username.charAt(0).toUpperCase() : '?';

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setSettingsOpen(false);
        }}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-lg"
      >
        {userInitial}
      </button>

      <AnimatePresence>
        {isOpen && !settingsOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 right-0 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <p className="font-semibold">{user.username}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
            <div className="py-2">
              <Link
                to="/dashboard/my-account"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <User size={16} />
                <span>My Account</span>
              </Link>
              <button
                onClick={() => setSettingsOpen(true)}
                className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Submenu */}
      <AnimatePresence>
        {isOpen && settingsOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 right-0 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <span className="font-semibold">Settings</span>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label="Back to profile menu"
              >
                &#8592;
              </button>
            </div>
            <div className="py-2">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              {/* Add more settings options here if needed */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
